from __future__ import annotations

from typing import Any

from app.data import (
    PROFILE_COPY,
    SCENARIOS,
    TIMELINE_STEPS,
    get_authoritative_sources,
    get_next_step,
    get_step,
)
from app.models import (
    AdaptiveLearningPath,
    AssistantAction,
    ChatResponse,
    Citation,
    ContentVersion,
    PersonalizedStep,
    QuizQuestion,
    QuizResponse,
    SmartSuggestion,
)


def _profile_label(profile: str) -> str:
    return PROFILE_COPY.get(profile, PROFILE_COPY["beginner"])["label"]


def _journey_guidance(profile: str, topic_id: str, completed_steps: list[str]) -> str:
    step = get_step(topic_id)
    next_step = get_next_step(topic_id)
    remaining = [item for item in TIMELINE_STEPS if item["id"] not in completed_steps]
    if profile == "first_time_voter":
        if step["id"] == "registration":
            return "Based on your profile, secure your registration details first so the rest of the journey feels predictable."
        return f"Based on your profile, stay with {step['title'].lower()} until you can explain it in one short sentence."
    if profile == "advanced":
        target = next_step["title"].lower() if next_step else "post-result verification"
        return f"Based on your profile, compare the controls in {step['title'].lower()} with {target} and look for the verification handoff."
    if remaining:
        return f"Based on your profile, finish {remaining[0]['title'].lower()} next so your learning path stays in sequence."
    return "Based on your profile, review your weakest quiz topics and revisit any step that still feels uncertain."


def _answer_summary(profile: str, topic_id: str, action: AssistantAction) -> str:
    step = get_step(topic_id)
    next_step = get_next_step(topic_id)
    if action == "next_step" and next_step:
        return f"The next election step after {step['title'].lower()} is {next_step['title'].lower()}."
    if action == "give_example":
        return f"The clearest way to understand {step['title'].lower()} is to connect it to a real election-day decision."
    if action == "explain_simply":
        return f"{step['title']} is the part of the election that makes the next step possible."
    if profile == "advanced":
        return f"{step['title']} is where rules, documentation, and verification controls matter most."
    return f"{step['title']} is the election stage that helps the process stay accurate and predictable."


def _base_content(profile: str, topic_id: str, action: AssistantAction) -> ContentVersion:
    step = get_step(topic_id)
    next_step = get_next_step(topic_id)
    focus = PROFILE_COPY.get(profile, PROFILE_COPY["beginner"])["focus"]

    if action == "give_example":
        explanation = f"{step['title']} becomes easier when you connect it to a real voter or candidate decision."
    elif action == "next_step" and next_step:
        explanation = f"After {step['title'].lower()}, the process moves to {next_step['title'].lower()}, where the focus shifts from {step['summary'].lower()} to {next_step['summary'].lower()}."
    elif action == "explain_simply":
        explanation = f"{step['title']} is the election stage that makes the next part possible and easier to trust."
    else:
        explanation = f"{step['title']} is the election stage where {step['description'].lower()} For a {_profile_label(profile).lower()}, the main focus is {focus}."

    steps = [
        f"Understand the purpose: {step['summary']}",
        f"Know the key items: {', '.join(step['keywords'][:3])}.",
        "Check what applies to you before the relevant deadline or voting day.",
        "Move to the next stage only after the current step is clear.",
    ]
    if profile == "advanced":
        steps = [
            f"Identify the legal or administrative purpose of {step['title'].lower()}.",
            f"Check the control points: {', '.join(step['keywords'])}.",
            "Separate voter responsibilities from candidate or election-office responsibilities.",
            "Look for verification records, deadlines, and official notices.",
        ]
    if profile == "first_time_voter":
        steps = [
            f"Start with the simple idea: {step['summary']}",
            "Keep your personal details and accepted ID ready.",
            "Use official sources to confirm dates, location, or eligibility.",
            "Ask for help early if something does not match your details.",
        ]

    example_map = {
        "registration": "A new voter checks their name on the voter list before election week, so they are not surprised at the polling station.",
        "nomination": "A candidate submits nomination papers, then officials verify whether the documents and eligibility rules are satisfied.",
        "campaign": "A voter compares two candidates by reading their promises, attending a local meeting, and checking whether claims are realistic.",
        "voting": "A voter reaches the assigned polling station, verifies their identity, and casts a private vote without showing the choice to anyone.",
        "counting": "Counting staff tally votes in supervised rounds while representatives and observers watch the procedure.",
        "results": "After counting is complete, the election authority announces the winning candidate and publishes the official result.",
    }

    next_text = (
        f"Open {next_step['title']} next and connect it back to {step['title']}."
        if next_step
        else "Review your score, revisit weak topics, and compare final results with the full timeline."
    )
    return ContentVersion(
        answer=_answer_summary(profile, topic_id, action),
        simple_explanation=explanation,
        steps=steps,
        real_life_example=example_map.get(topic_id, step["summary"]),
        what_to_do_next=next_text,
    )


def _eli10_content(topic_id: str, action: AssistantAction) -> ContentVersion:
    step = get_step(topic_id)
    next_step = get_next_step(topic_id)
    simple_map = {
        "registration": "Registration is like putting your name on a class list before an event. If your name is there, you are allowed to join.",
        "nomination": "Nomination is when people who want the job officially put their name forward.",
        "campaign": "Campaigning is when candidates explain their ideas so voters can choose carefully.",
        "voting": "Voting is when each person quietly chooses who they want to support.",
        "counting": "Counting is when officials add up all the votes carefully.",
        "results": "Results are when everyone finds out who got the most votes.",
    }
    steps = [
        f"Know what this step does: {step['summary']}",
        "Check the one important detail for you.",
        "Use an official source if anything feels confusing.",
        "Go to the next step when this one makes sense.",
    ]
    if action == "give_example":
        example = "Think of choosing a class monitor: first people join the list, then candidates share ideas, then everyone votes, then votes are counted."
    else:
        example = f"For {step['title'].lower()}, imagine a school activity where everyone follows the same rule so the choice stays fair."
    return ContentVersion(
        answer=_answer_summary("first_time_voter", topic_id, action),
        simple_explanation=simple_map.get(topic_id, step["summary"]),
        steps=steps,
        real_life_example=example,
        what_to_do_next=(
            f"Next, learn {next_step['title'].lower()} in the same simple way."
            if next_step
            else "Now review the full journey from registration to results."
        ),
    )


def _citations(topic_id: str) -> list[Citation]:
    return [Citation(**source) for source in get_authoritative_sources(topic_id)]


def _smart_suggestions(
    profile: str,
    topic_id: str,
    action: AssistantAction,
    completed_steps: list[str],
    scenario_id: str | None = None,
) -> list[SmartSuggestion]:
    step = get_step(topic_id)
    next_step = get_next_step(topic_id)
    suggestions: list[SmartSuggestion] = []

    if action != "explain_simply":
        suggestions.append(
            SmartSuggestion(
                label=f"Explain {step['title']} simply",
                topic_id=topic_id,
                action="explain_simply",
                reason="Switch to ELI10 mode for a lower-jargon explanation.",
            )
        )

    if next_step and next_step["id"] not in completed_steps:
        suggestions.append(
            SmartSuggestion(
                label=f"Preview {next_step['title']}",
                topic_id=next_step["id"],
                action="explain",
                reason="Stay one step ahead in the timeline so the journey feels connected.",
            )
        )

    if scenario_id is None and step["id"] == "registration":
        suggestions.append(
            SmartSuggestion(
                label="What if I moved city?",
                topic_id="registration",
                action="scenario",
                scenario_id="moved_city",
                reason="Registration questions often depend on your current address.",
            )
        )
    elif scenario_id is None and step["id"] == "voting":
        suggestions.append(
            SmartSuggestion(
                label="Guide for first-time voting",
                topic_id="voting",
                action="scenario",
                scenario_id="first_time_vote",
                reason="This scenario turns the voting step into a practical checklist.",
            )
        )

    if profile == "advanced" and len(suggestions) < 3:
        suggestions.append(
            SmartSuggestion(
                label=f"What's the next control after {step['title']}?",
                topic_id=topic_id,
                action="next_step",
                reason="Focus on the verification handoff between stages.",
            )
        )

    return suggestions[:3]


def build_chat_response(
    profile: str,
    topic_id: str,
    action: AssistantAction,
    completed_steps: list[str],
    scenario_id: str | None = None,
    *,
    preferred_version: str = "standard",
    source: str = "guided-engine",
) -> ChatResponse:
    if action == "scenario" and scenario_id in SCENARIOS:
        scenario = SCENARIOS[scenario_id]
        topic_id = scenario["topic_id"]
        standard = ContentVersion(
            answer=f"{scenario['title']} can usually be solved by confirming official records first, then fixing the missing document, address, or polling detail.",
            simple_explanation=scenario["summary"],
            steps=scenario["steps"],
            real_life_example=scenario["example"],
            what_to_do_next=f"Open {get_step(topic_id)['title']} and mark it complete once you know your required document, location, or deadline.",
        )
        eli10 = ContentVersion(
            answer=f"{scenario['title']} means one practical issue needs to be fixed before voting feels easy again.",
            simple_explanation=f"{scenario['title']} means you need to fix one practical problem before voting feels easy.",
            steps=[
                "Find your name or details in the official voter list.",
                "Use the correct official form or help desk.",
                "Keep a photo ID or proof ready.",
                "Check again before voting day.",
            ],
            real_life_example=scenario["example"],
            what_to_do_next="Start with the registration step because most voting-day problems are solved there first."
            if topic_id == "registration"
            else "Start with the voting step and use the checklist one item at a time.",
        )
        title = scenario["title"]
    else:
        standard = _base_content(profile, topic_id, action)
        eli10 = _eli10_content(topic_id, action)
        title = get_step(topic_id)["title"]

    return ChatResponse(
        topic_id=topic_id,
        title=title,
        action=action,
        preferred_version="eli10" if preferred_version == "eli10" else "standard",
        standard=standard,
        eli10_version=eli10,
        journey_guidance=_journey_guidance(profile, topic_id, completed_steps),
        smart_suggestions=_smart_suggestions(profile, topic_id, action, completed_steps, scenario_id),
        citations=_citations(topic_id),
        source=source,  # type: ignore[arg-type]
    )


def _score_target(score: int) -> int:
    return 5 if score > 3 else 3


def _confidence_score(quiz_scores: dict[str, int]) -> int:
    if not quiz_scores:
        return 52
    ratios = [score / _score_target(score) for score in quiz_scores.values()]
    return max(35, min(100, round(sum(ratios) / len(ratios) * 100)))


def _step_card(step: dict[str, Any], reason: str, priority: int) -> PersonalizedStep:
    return PersonalizedStep(
        topic_id=step["id"],
        title=step["title"],
        reason=reason,
        priority=priority,
    )


def build_personalized_path(
    current_topic_id: str,
    completed_steps: list[str],
    quiz_scores: dict[str, int],
) -> list[PersonalizedStep]:
    completed_set = set(completed_steps)
    pending = [step for step in TIMELINE_STEPS if step["id"] not in completed_set]
    weakest_completed = sorted(
        (step for step in TIMELINE_STEPS if step["id"] in quiz_scores and quiz_scores[step["id"]] <= 1),
        key=lambda step: quiz_scores.get(step["id"], 0),
    )
    emerging_strength = sorted(
        (step for step in TIMELINE_STEPS if step["id"] in quiz_scores and quiz_scores[step["id"]] >= 3),
        key=lambda step: quiz_scores.get(step["id"], 0),
        reverse=True,
    )

    path: list[PersonalizedStep] = []

    for step in weakest_completed:
        path.append(_step_card(step, "Low quiz accuracy suggests this topic should be revised before deeper topics.", 1))

    current = get_step(current_topic_id)
    if current["id"] not in completed_set and all(item.topic_id != current["id"] for item in path):
        path.append(_step_card(current, "You are actively working here, so this stays near the front of the path.", 2))

    if emerging_strength:
        advanced_candidates = [
            step
            for step in pending
            if step["id"] in {"campaign", "counting", "results"} and all(item.topic_id != step["id"] for item in path)
        ]
        for step in advanced_candidates[:2]:
            path.append(
                _step_card(
                    step,
                    "Unlocked early because your recent quiz performance shows strong grasp of the foundations.",
                    2,
                )
            )

    for step in pending:
        if all(item.topic_id != step["id"] for item in path):
            path.append(_step_card(step, "This is the next unfinished step in the election timeline.", 3))

    return path[:4]


def build_adaptive_learning_path(
    current_topic_id: str,
    completed_steps: list[str],
    quiz_scores: dict[str, int],
) -> AdaptiveLearningPath:
    completed_set = set(completed_steps)
    current = get_step(current_topic_id)
    pending = [step for step in TIMELINE_STEPS if step["id"] not in completed_set]
    weakest = sorted(
        (step for step in TIMELINE_STEPS if quiz_scores.get(step["id"], 0) <= 1 and step["id"] in quiz_scores),
        key=lambda step: quiz_scores.get(step["id"], 0),
    )
    strongest = sorted(
        (step for step in TIMELINE_STEPS if quiz_scores.get(step["id"], 0) >= 3),
        key=lambda step: quiz_scores.get(step["id"], 0),
        reverse=True,
    )
    confidence = _confidence_score(quiz_scores)
    current_score = quiz_scores.get(current_topic_id)
    progress_ratio = len(completed_set) / max(len(TIMELINE_STEPS), 1)

    if weakest:
        focus = weakest[0]
        support_topics = [
            _step_card(focus, "Revisit this topic with sources and examples before moving on.", 1),
        ]
        if current["id"] != focus["id"]:
            support_topics.append(
                _step_card(current, "Stay connected to your current step while fixing the weakest concept.", 2)
            )
        return AdaptiveLearningPath(
            status="revise",
            confidence_score=confidence,
            headline=f"Revision recommended: {focus['title']}",
            rationale="Low quiz accuracy means the system is prioritizing reinforcement before unlocking harder material.",
            recommended_action=f"Review {focus['title']} again, then retake the quiz before advancing.",
            focus_topic_id=focus["id"],
            focus_topic_title=focus["title"],
            support_topics=support_topics[:2],
            unlocked_topics=[],
        )

    if (current_score is not None and current_score >= 3) or (progress_ratio >= 0.5 and strongest):
        unlocked = [
            _step_card(
                step,
                "Unlocked because you are scoring well and have enough completed context to handle deeper process checks.",
                2,
            )
            for step in pending
            if step["id"] in {"campaign", "counting", "results"}
        ][:2]
        focus = unlocked[0] if unlocked else _step_card(current, "Keep momentum on the current topic.", 2)
        return AdaptiveLearningPath(
            status="advance",
            confidence_score=confidence,
            headline="Advanced topics unlocked",
            rationale="High quiz accuracy and completed milestones indicate readiness for oversight-heavy stages.",
            recommended_action=f"Open {focus.title} next to stretch beyond the baseline journey.",
            focus_topic_id=focus.topic_id,
            focus_topic_title=focus.title,
            support_topics=[
                _step_card(current, "Your current topic remains useful context for the advanced preview.", 2),
            ],
            unlocked_topics=unlocked,
        )

    next_step = pending[0] if pending else current
    return AdaptiveLearningPath(
        status="continue",
        confidence_score=confidence,
        headline="Keep building the foundation",
        rationale="Progress is steady, so the best move is to keep the timeline sequence intact.",
        recommended_action=f"Continue with {next_step['title']} and use the quiz to confirm mastery.",
        focus_topic_id=next_step["id"],
        focus_topic_title=next_step["title"],
        support_topics=[
            _step_card(next_step, "This is the strongest next step for maintaining learning continuity.", 2),
        ],
        unlocked_topics=[],
    )


def calculate_learning_score(completed_steps: list[str], quiz_scores: dict[str, int]) -> int:
    completion_points = len(set(completed_steps)) * 18
    quiz_points = sum(score * 12 for score in quiz_scores.values())
    mastery_bonus = sum(12 for score in quiz_scores.values() if score >= 3)
    consistency_bonus = 10 if quiz_scores and all(score >= 2 for score in quiz_scores.values()) else 0
    return completion_points + quiz_points + mastery_bonus + consistency_bonus


def build_quiz_response(profile: str, topic_id: str, count: int, source: str = "guided-engine") -> QuizResponse:
    step = get_step(topic_id)
    questions: list[dict[str, Any]] = [
        {
            "question": f"What is the main purpose of {step['title'].lower()}?",
            "options": [
                step["summary"],
                "To skip the formal process and announce a winner immediately.",
                "To replace every other stage of the election.",
                "To keep voters from learning about the election.",
            ],
            "correct_answer": 0,
            "explanation": f"{step['title']} matters because it helps the election move through a clear, verified stage.",
        },
        {
            "question": "Why should voters follow the timeline instead of waiting until the last day?",
            "options": [
                "Because each stage has a different purpose and some actions need time.",
                "Because voting is optional only after results.",
                "Because candidates count votes before campaigns.",
                "Because registration happens after counting.",
            ],
            "correct_answer": 0,
            "explanation": "Election steps happen in order, and missing an early requirement can create problems later.",
        },
        {
            "question": f"Which detail is most connected to {step['title'].lower()}?",
            "options": [
                step["keywords"][0].title(),
                "Movie tickets",
                "Weather forecast only",
                "Sports ranking",
            ],
            "correct_answer": 0,
            "explanation": f"{step['keywords'][0].title()} is one of the key ideas in this stage.",
        },
        {
            "question": "What should a careful learner do after understanding one election step?",
            "options": [
                "Connect it to the next step in the timeline.",
                "Ignore the rest of the process.",
                "Assume rules are the same everywhere without checking.",
                "Wait for results before learning about voting.",
            ],
            "correct_answer": 0,
            "explanation": "The process is easier when each stage is connected to the next one.",
        },
        {
            "question": "What makes an election process easier to trust?",
            "options": [
                "Clear steps, public rules, verification, and official results.",
                "Secret deadlines that voters cannot check.",
                "Skipping identity checks and counting rules.",
                "Only listening to campaign slogans.",
            ],
            "correct_answer": 0,
            "explanation": "Trust improves when the process is transparent, predictable, and verifiable.",
        },
    ]
    if profile == "advanced":
        questions[1]["question"] = "Which habit is most useful for advanced election-process analysis?"
        questions[1]["options"][0] = "Separate legal requirements, administrative checks, and voter-facing actions."
        questions[1]["explanation"] = "Advanced analysis is clearer when responsibilities and verification points are separated."

    selected = questions[:count]
    return QuizResponse(
        topic_id=topic_id,
        title=f"{step['title']} Quiz",
        questions=[
            QuizQuestion(
                id=f"{topic_id}-{index + 1}",
                question=item["question"],
                options=item["options"],
                correct_answer=item["correct_answer"],
                explanation=item["explanation"],
            )
            for index, item in enumerate(selected)
        ],
        source=source,  # type: ignore[arg-type]
    )
