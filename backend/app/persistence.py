from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any

from app.data import TIMELINE_STEPS, get_step


class StateStore:
    def __init__(self, path: str | None = None) -> None:
        default_path = Path(__file__).resolve().parent.parent / "storage" / "app_state.json"
        self.path = Path(path or os.getenv("APP_STATE_FILE") or default_path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_state(self) -> dict[str, Any]:
        return {"users": {}}

    def _read_state(self) -> dict[str, Any]:
        if not self.path.exists():
            return self._default_state()
        with self.path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def _write_state(self, payload: dict[str, Any]) -> None:
        with self.path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=True, indent=2, sort_keys=True)

    def upsert_progress(
        self,
        *,
        user_id: str,
        profile: str,
        current_topic_id: str,
        completed_steps: list[str],
        quiz_scores: dict[str, int],
        personalized_path: list[dict[str, Any]],
        progress_percent: int,
        learning_score: int,
    ) -> dict[str, Any]:
        with self._lock:
            state = self._read_state()
            users = state.setdefault("users", {})
            now = datetime.now(timezone.utc).isoformat()
            existing = users.get(user_id, {})
            record = {
                "created_at": existing.get("created_at", now),
                "updated_at": now,
                "profile": profile,
                "current_topic_id": current_topic_id,
                "completed_steps": sorted(set(completed_steps)),
                "quiz_scores": quiz_scores,
                "progress_percent": progress_percent,
                "learning_score": learning_score,
                "personalized_path": personalized_path,
            }
            users[user_id] = record
            self._write_state(state)
            return record

    def leaderboard(
        self,
        *,
        limit: int = 10,
        current_user_id: str | None = None,
    ) -> tuple[list[dict[str, Any]], int | None]:
        with self._lock:
            users = self._read_state().get("users", {})
        ranked = sorted(
            users.items(),
            key=lambda item: (
                int(item[1].get("learning_score", 0)),
                int(item[1].get("progress_percent", 0)),
                len(item[1].get("completed_steps", [])),
            ),
            reverse=True,
        )
        current_user_rank: int | None = None
        entries: list[dict[str, Any]] = []
        for rank, (user_id, payload) in enumerate(ranked, start=1):
            if current_user_id and user_id == current_user_id:
                current_user_rank = rank
            if len(entries) >= limit:
                continue
            entries.append(
                {
                    "rank": rank,
                    "user_id_alias": self._alias(user_id),
                    "profile": payload.get("profile"),
                    "learning_score": int(payload.get("learning_score", 0)),
                    "progress_percent": int(payload.get("progress_percent", 0)),
                    "completed_count": len(payload.get("completed_steps", [])),
                    "current_topic_title": get_step(payload.get("current_topic_id", TIMELINE_STEPS[0]["id"]))["title"],
                    "is_current_user": user_id == current_user_id,
                }
            )
        return entries, current_user_rank

    @staticmethod
    def _alias(user_id: str) -> str:
        suffix = user_id.split("-")[-1][-4:]
        return f"Learner-{suffix.upper()}"
