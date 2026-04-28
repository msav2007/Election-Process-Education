from __future__ import annotations

import os
import time
from collections import defaultdict, deque
import logging

from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.observability import log_api_event
from app.security import get_client_ip


logger = logging.getLogger("election_copilot.rate_limit")


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app) -> None:  # type: ignore[no-untyped-def]
        super().__init__(app)
        self.window_seconds = max(10, int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")))
        self.default_limit = max(5, int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "45")))
        self.buckets: dict[tuple[str, str], deque[float]] = defaultdict(deque)
        self.skipped_paths = {"/", "/health", "/test", "/ping", "/docs", "/openapi.json", "/redoc"}
        self.path_limits = {
            "/auth/guest": max(2, int(os.getenv("RATE_LIMIT_AUTH_REQUESTS", "8"))),
            "/chat": max(5, int(os.getenv("RATE_LIMIT_CHAT_REQUESTS", "25"))),
            "/quiz": max(2, int(os.getenv("RATE_LIMIT_QUIZ_REQUESTS", "12"))),
        }

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        if request.method == "OPTIONS" or request.url.path in self.skipped_paths:
            return await call_next(request)

        client_ip = get_client_ip(request)
        limit = self.path_limits.get(request.url.path, self.default_limit)
        bucket_key = (client_ip, request.url.path)
        now = time.monotonic()
        bucket = self.buckets[bucket_key]

        while bucket and now - bucket[0] >= self.window_seconds:
            bucket.popleft()

        if len(bucket) >= limit:
            retry_after = max(1, int(self.window_seconds - (now - bucket[0])))
            log_api_event(
                logger,
                logging.WARNING,
                "rate_limit_exceeded",
                request_id=getattr(request.state, "request_id", None) or request.headers.get("x-request-id"),
                path=request.url.path,
                method=request.method,
                client_ip=client_ip,
                limit=limit,
                retry_after_seconds=retry_after,
            )
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "message": "That action is temporarily cooling down to keep the assistant responsive for everyone.",
                    "user_action": "Wait a moment, then retry with a narrower follow-up or continue with the local guidance already on screen.",
                    "suggestions": [
                        "Review the current explanation and sources while the timer resets.",
                        "Retry after the cooldown shown below.",
                        "Ask one focused question instead of several unrelated ones in one message.",
                    ],
                    "retry_after_seconds": retry_after,
                    "request_id": getattr(request.state, "request_id", None) or request.headers.get("x-request-id"),
                },
                headers={"Retry-After": str(retry_after)},
            )

        bucket.append(now)
        response = await call_next(request)
        return response
