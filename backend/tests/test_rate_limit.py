from __future__ import annotations

import asyncio

from starlette.requests import Request
from starlette.responses import Response

from app.rate_limit import RateLimitMiddleware


def _request() -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/chat",
        "headers": [(b"x-forwarded-for", b"203.0.113.10")],
        "query_string": b"",
        "client": ("203.0.113.10", 12345),
        "scheme": "http",
        "server": ("testserver", 80),
        "http_version": "1.1",
    }
    return Request(scope)


def test_rate_limit_blocks_after_threshold(monkeypatch) -> None:
    monkeypatch.setenv("RATE_LIMIT_WINDOW_SECONDS", "60")
    monkeypatch.setenv("RATE_LIMIT_CHAT_REQUESTS", "5")
    middleware = RateLimitMiddleware(app=lambda scope, receive, send: None)

    async def call_next(_: Request) -> Response:
        return Response("ok", status_code=200)

    responses = [asyncio.run(middleware.dispatch(_request(), call_next)) for _ in range(6)]

    assert all(response.status_code == 200 for response in responses[:5])
    limited = responses[-1]
    assert limited.status_code == 429
    assert int(limited.headers["Retry-After"]) >= 59
    assert b"rate_limit_exceeded" in limited.body
