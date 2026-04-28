from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app
from app.persistence import StateStore
import app.main as main_module


def _store_path() -> str:
    directory = Path(__file__).resolve().parent / ".tmp"
    directory.mkdir(parents=True, exist_ok=True)
    return str(directory / f"{uuid4().hex}.json")


def _auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/auth/guest",
        json={"profile": "beginner"},
        headers={"X-Client-Id": "election-copilot-web"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_chat_requires_authentication() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/chat",
            json={
                "profile": "beginner",
                "topic_id": "registration",
                "action": "explain",
                "eli10": False,
                "completed_steps": [],
            },
        )
    assert response.status_code == 401


def test_system_endpoints_are_available() -> None:
    with TestClient(app) as client:
        root_response = client.get("/")
        health_response = client.get("/health")
        test_response = client.get("/test")
        ping_response = client.get("/ping")
        docs_response = client.get("/docs")

    assert root_response.status_code == 200
    assert root_response.json() == {"message": "API running"}

    assert health_response.status_code == 200
    assert health_response.json() == {"status": "ok"}

    assert test_response.status_code == 200
    assert test_response.json() == {"working": True}

    assert ping_response.status_code == 200
    assert ping_response.json() == {"ping": "working"}

    assert docs_response.status_code == 200


def test_chat_returns_eli10_and_suggestions() -> None:
    main_module.store = StateStore(_store_path())

    with TestClient(app) as client:
        headers = _auth_headers(client)
        response = client.post(
            "/chat",
            headers=headers,
            json={
                "profile": "first_time_voter",
                "topic_id": "registration",
                "action": "explain",
                "eli10": True,
                "completed_steps": [],
                "user_input": "<script>alert(1)</script> Explain registration simply",
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["preferred_version"] == "eli10"
    assert payload["smart_suggestions"]
    assert len(payload["citations"]) >= 2
    assert payload["standard"]["answer"]
    assert payload["eli10_version"]["simple_explanation"]


def test_progress_persists_and_updates_leaderboard() -> None:
    main_module.store = StateStore(_store_path())

    with TestClient(app) as client:
        headers = _auth_headers(client)
        progress_response = client.post(
            "/progress",
            headers=headers,
            json={
                "profile": "beginner",
                "current_topic_id": "registration",
                "completed_steps": ["registration"],
                "quiz_scores": {"registration": 3},
            },
        )
        leaderboard_response = client.get("/leaderboard", headers=headers)

    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert progress["learning_score"] > 0
    assert progress["personalized_path"]
    assert progress["adaptive_path"]["status"] in {"continue", "advance", "revise"}

    assert leaderboard_response.status_code == 200
    leaderboard = leaderboard_response.json()
    entries = leaderboard["entries"]
    assert len(entries) == 1
    assert entries[0]["user_id_alias"].startswith("Learner-")
    assert entries[0]["learning_score"] == progress["learning_score"]
    assert entries[0]["rank"] == 1
    assert entries[0]["is_current_user"] is True
    assert leaderboard["current_user_rank"] == 1


def test_invalid_topic_id_is_rejected() -> None:
    main_module.store = StateStore(_store_path())

    with TestClient(app) as client:
        headers = _auth_headers(client)
        response = client.post(
            "/quiz",
            headers=headers,
            json={
                "profile": "beginner",
                "topic_id": "not-a-step",
                "count": 3,
                "eli10": False,
            },
        )

    assert response.status_code == 422
