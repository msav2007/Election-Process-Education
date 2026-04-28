from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.data import SCENARIO_IDS, STEP_IDS
from app.sanitization import sanitize_text


Profile = Literal["first_time_voter", "beginner", "advanced"]
AssistantAction = Literal["explain", "explain_simply", "give_example", "next_step", "scenario"]
ResponseVersion = Literal["standard", "eli10"]


class AuthRequest(BaseModel):
    profile: Profile | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user_id: str
    expires_at: datetime


class Citation(BaseModel):
    title: str
    url: str
    note: str
    publisher: str
    trust_label: Literal["Official source", "Federal guidance", "Election administration"]


class ChatRequest(BaseModel):
    profile: Profile = "beginner"
    topic_id: str = Field(default="registration")
    action: AssistantAction = "explain"
    eli10: bool = False
    scenario_id: str | None = None
    completed_steps: list[str] = Field(default_factory=list)
    user_input: str | None = None

    @field_validator("topic_id")
    @classmethod
    def validate_topic_id(cls, value: str) -> str:
        if value not in STEP_IDS:
            raise ValueError("Unknown topic_id")
        return value

    @field_validator("scenario_id")
    @classmethod
    def validate_scenario_id(cls, value: str | None) -> str | None:
        if value is not None and value not in SCENARIO_IDS:
            raise ValueError("Unknown scenario_id")
        return value

    @field_validator("completed_steps")
    @classmethod
    def validate_completed_steps(cls, value: list[str]) -> list[str]:
        return [step_id for step_id in value if step_id in STEP_IDS]

    @field_validator("user_input", mode="before")
    @classmethod
    def clean_user_input(cls, value: str | None) -> str | None:
        return sanitize_text(value)


class ContentVersion(BaseModel):
    answer: str
    simple_explanation: str
    steps: list[str]
    real_life_example: str
    what_to_do_next: str


class SmartSuggestion(BaseModel):
    label: str
    topic_id: str
    reason: str
    action: AssistantAction = "explain"
    scenario_id: str | None = None


class ChatResponse(BaseModel):
    topic_id: str
    title: str
    action: AssistantAction
    preferred_version: ResponseVersion
    standard: ContentVersion
    eli10_version: ContentVersion
    journey_guidance: str
    smart_suggestions: list[SmartSuggestion]
    citations: list[Citation]
    source: Literal["gemini", "guided-engine"]


class TimelineStep(BaseModel):
    id: str
    order: int
    title: str
    short_title: str
    summary: str
    description: str
    next_step_id: str | None
    keywords: list[str]


class TimelineResponse(BaseModel):
    steps: list[TimelineStep]


class QuizRequest(BaseModel):
    profile: Profile = "beginner"
    topic_id: str = "registration"
    count: int = Field(default=3, ge=1, le=5)
    eli10: bool = False

    @field_validator("topic_id")
    @classmethod
    def validate_topic_id(cls, value: str) -> str:
        if value not in STEP_IDS:
            raise ValueError("Unknown topic_id")
        return value


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer: int = Field(ge=0, le=3)
    explanation: str


class QuizResponse(BaseModel):
    topic_id: str
    title: str
    questions: list[QuizQuestion]
    source: Literal["gemini", "guided-engine"]


class PersonalizedStep(BaseModel):
    topic_id: str
    title: str
    reason: str
    priority: int = Field(ge=1, le=3)


class AdaptiveLearningPath(BaseModel):
    status: Literal["revise", "continue", "advance"]
    confidence_score: int = Field(ge=0, le=100)
    headline: str
    rationale: str
    recommended_action: str
    focus_topic_id: str | None
    focus_topic_title: str | None
    support_topics: list[PersonalizedStep] = Field(default_factory=list)
    unlocked_topics: list[PersonalizedStep] = Field(default_factory=list)


class ProgressRequest(BaseModel):
    profile: Profile = "beginner"
    current_topic_id: str = "registration"
    completed_steps: list[str] = Field(default_factory=list)
    quiz_scores: dict[str, int] = Field(default_factory=dict)

    @field_validator("current_topic_id")
    @classmethod
    def validate_current_topic_id(cls, value: str) -> str:
        if value not in STEP_IDS:
            raise ValueError("Unknown current_topic_id")
        return value

    @field_validator("completed_steps")
    @classmethod
    def normalize_completed_steps(cls, value: list[str]) -> list[str]:
        return [step_id for step_id in value if step_id in STEP_IDS]

    @field_validator("quiz_scores")
    @classmethod
    def normalize_quiz_scores(cls, value: dict[str, int]) -> dict[str, int]:
        return {key: max(0, min(int(score), 5)) for key, score in value.items() if key in STEP_IDS}


class ProgressResponse(BaseModel):
    completed_count: int
    total_count: int
    progress_percent: int
    current_phase: str
    next_step_id: str | None
    next_step_title: str | None
    recommended_topic_id: str | None
    recommended_topic_title: str | None
    learning_score: int
    personalized_path: list[PersonalizedStep]
    adaptive_path: AdaptiveLearningPath
    message: str


class LeaderboardEntry(BaseModel):
    rank: int
    user_id_alias: str
    profile: Profile | None = None
    learning_score: int
    progress_percent: int
    completed_count: int
    current_topic_title: str
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    current_user_rank: int | None = None


class ErrorResponse(BaseModel):
    error: str
    message: str
    user_action: str
    suggestions: list[str] = Field(default_factory=list)
    request_id: str | None = None
    retry_after_seconds: int | None = None
