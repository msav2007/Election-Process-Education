from __future__ import annotations

import json
import logging
import os
from typing import Any

import httpx

from app.data import PROFILE_COPY, SCENARIOS, get_authoritative_sources, get_step
from app.guided_engine import build_chat_response, build_quiz_response
from app.models import AssistantAction, ChatResponse, ContentVersion, QuizQuestion, QuizResponse


logger = logging.getLogger("election_copilot.gemini")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def _extract_text(payload: dict[str, Any]) -> str:
    candidates = payload.get("candidates") or []
    if not candidates:
        raise ValueError("Gemini returned no candidates")
    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts or "text" not in parts[0]:
        raise ValueError("Gemini response did not include text")
    return parts[0]["text"]


def _safe_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()
    return json.loads(cleaned)


async def _generate_json(prompt: str) -> dict[str, Any] | None:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    url = GEMINI_ENDPOINT.format(model=model)
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.25,
            "responseMimeType": "application/json",
        },
    }
    timeout = httpx.Timeout(20.0, connect=10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, params={"key": api_key}, json=body)
        response.raise_for_status()
        return _safe_json(_extract_text(response.json()))


def _chat_prompt(
    profile: str,
    topic_id: str,
    action: AssistantAction,
    completed_steps: list[str],
    scenario_id: str | None,
    user_input: str | None,
    eli10: bool,
) -> str:
    step = get_step(topic_id)
    scenario = SCENARIOS.get(scenario_id or "")
    profile_info = PROFILE_COPY.get(profile, PROFILE_COPY["beginner"])
    scenario_text = f"{scenario['title']} - {scenario['summary']}" if scenario else "none"
    input_text = user_input or (f"Scenario: {scenario_text}" if scenario else f"{action} for {step['title']}")
    source_lines = "\n".join(
        f"- {item['title']}: {item['url']} ({item['note']})" for item in get_authoritative_sources(step["id"])
    )
    return f"""
You are a civic-learning assistant helping users understand the election process.

Safety rules:
- Stay strictly educational and procedural.
- Do not give partisan, ideological, or candidate endorsement advice.
- Use the official-source context below as grounding.
- Make the direct answer explicit before the deeper explanation.
- If the user describes a scenario, give concrete, real-world steps.
- Keep the output factual, practical, and easy to follow.

Audience context:
- User profile: {profile_info['label']} ({profile_info['tone']})
- Profile focus: {profile_info['focus']}
- Current timeline topic: {step['title']} - {step['description']}
- Requested action: {action}
- Scenario context: {scenario_text}
- Completed timeline steps: {completed_steps}
- Prefer ELI10 tone right now: {eli10}

Grounding sources:
{source_lines}

User input:
{input_text}

Return only valid JSON with this exact shape:
{{
  "standard": {{
    "answer": "one direct answer sentence",
    "simple_explanation": "short and clear explanation",
    "steps": ["4-6 real-world action steps the user can take"],
    "real_life_example": "one specific real-life example",
    "what_to_do_next": "one actionable next step"
  }},
  "eli10_version": {{
    "answer": "one very simple direct answer sentence",
    "simple_explanation": "very simple explanation for a 10-year-old",
    "steps": ["4 short practical points"],
    "real_life_example": "simple specific example",
    "what_to_do_next": "one simple next action"
  }},
  "journey_guidance": "personalized guidance based on the user profile"
}}
"""


def _quiz_prompt(profile: str, topic_id: str, count: int, eli10: bool) -> str:
    step = get_step(topic_id)
    profile_info = PROFILE_COPY.get(profile, PROFILE_COPY["beginner"])
    level = "very simple and plain" if eli10 else profile_info["tone"]
    return f"""
Create {count} multiple-choice questions for Election Copilot AI.
Topic: {step['title']} - {step['description']}
User profile: {profile_info['label']}
Language level: {level}

Return only valid JSON with this exact shape:
{{
  "questions": [
    {{
      "id": "stable-id",
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": 0,
      "explanation": "why the correct option is right"
    }}
  ]
}}

Rules:
- correct_answer must be an index from 0 to 3.
- Focus on election process understanding, not partisan preference.
- Every question must have exactly four options.
"""


async def create_chat_response(
    profile: str,
    topic_id: str,
    action: AssistantAction,
    completed_steps: list[str],
    scenario_id: str | None,
    *,
    eli10: bool,
    user_input: str | None = None,
) -> ChatResponse:
    fallback = build_chat_response(
        profile,
        topic_id,
        action,
        completed_steps,
        scenario_id,
        preferred_version="eli10" if eli10 else "standard",
    )
    try:
        generated = await _generate_json(
            _chat_prompt(profile, topic_id, action, completed_steps, scenario_id, user_input, eli10)
        )
        if not generated:
            return fallback
        return ChatResponse(
            topic_id=fallback.topic_id,
            title=fallback.title,
            action=action,
            preferred_version=fallback.preferred_version,
            standard=ContentVersion(**generated["standard"]),
            eli10_version=ContentVersion(**generated["eli10_version"]),
            journey_guidance=generated["journey_guidance"],
            smart_suggestions=fallback.smart_suggestions,
            citations=fallback.citations,
            source="gemini",
        )
    except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        logger.warning("gemini_chat_fallback", exc_info=exc)
        return fallback


async def create_quiz_response(profile: str, topic_id: str, count: int, eli10: bool) -> QuizResponse:
    fallback = build_quiz_response(profile, topic_id, count)
    try:
        generated = await _generate_json(_quiz_prompt(profile, topic_id, count, eli10))
        if not generated:
            return fallback
        questions = []
        for index, item in enumerate(generated.get("questions", [])[:count]):
            options = item.get("options", [])
            if len(options) != 4:
                continue
            questions.append(
                QuizQuestion(
                    id=item.get("id") or f"{topic_id}-{index + 1}",
                    question=item["question"],
                    options=options,
                    correct_answer=int(item["correct_answer"]),
                    explanation=item["explanation"],
                )
            )
        if not questions:
            return fallback
        return QuizResponse(
            topic_id=topic_id,
            title=f"{get_step(topic_id)['title']} Quiz",
            questions=questions,
            source="gemini",
        )
    except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        logger.warning("gemini_quiz_fallback", exc_info=exc)
        return fallback
