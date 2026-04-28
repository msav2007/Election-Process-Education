from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import Header, HTTPException, Request, status


TOKEN_TYPE = "bearer"


@dataclass(frozen=True)
class AuthContext:
    user_id: str
    expires_at: datetime


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _auth_secret() -> bytes:
    secret = os.getenv("APP_AUTH_SECRET", "dev-election-copilot-secret")
    return secret.encode("utf-8")


def _client_id() -> str:
    return os.getenv("PUBLIC_CLIENT_ID", "election-copilot-web")


def _ttl_seconds() -> int:
    return max(300, int(os.getenv("SESSION_TTL_SECONDS", "86400")))


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _sign(payload_bytes: bytes) -> bytes:
    return hmac.new(_auth_secret(), payload_bytes, hashlib.sha256).digest()


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _b64decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(f"{raw}{padding}".encode("utf-8"))


def issue_guest_token() -> tuple[str, AuthContext]:
    issued_at = _utc_now()
    expires_at = issued_at + timedelta(seconds=_ttl_seconds())
    payload = {
        "sub": f"learner-{secrets.token_hex(6)}",
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    token = f"{_b64encode(payload_bytes)}.{_b64encode(_sign(payload_bytes))}"
    return token, AuthContext(user_id=payload["sub"], expires_at=expires_at)


def verify_token(token: str) -> AuthContext:
    try:
        payload_part, signature_part = token.split(".", 1)
        payload_bytes = _b64decode(payload_part)
        expected_signature = _sign(payload_bytes)
        provided_signature = _b64decode(signature_part)
    except (ValueError, json.JSONDecodeError, base64.binascii.Error) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format") from exc

    if not hmac.compare_digest(expected_signature, provided_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature")

    payload = json.loads(payload_bytes.decode("utf-8"))
    expires_at = datetime.fromtimestamp(int(payload["exp"]), tz=timezone.utc)
    if expires_at <= _utc_now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session token expired")

    return AuthContext(user_id=str(payload["sub"]), expires_at=expires_at)


async def require_auth(authorization: str | None = Header(default=None)) -> AuthContext:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != TOKEN_TYPE or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    return verify_token(token)


def validate_client_id_header(x_client_id: str | None) -> None:
    if not x_client_id or x_client_id != _client_id():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid client identifier")
