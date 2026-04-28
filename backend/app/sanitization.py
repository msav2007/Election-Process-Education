from __future__ import annotations

import re


MAX_USER_INPUT_LENGTH = 600
_TAG_PATTERN = re.compile(r"<[^>]+>")
_CONTROL_PATTERN = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")
_SPACE_PATTERN = re.compile(r"\s+")


def sanitize_text(value: str | None, *, max_length: int = MAX_USER_INPUT_LENGTH) -> str | None:
    if value is None:
        return None

    cleaned = _TAG_PATTERN.sub(" ", value)
    cleaned = _CONTROL_PATTERN.sub("", cleaned)
    cleaned = _SPACE_PATTERN.sub(" ", cleaned).strip()

    if not cleaned:
        return None
    if len(cleaned) > max_length:
        cleaned = cleaned[: max_length - 1].rstrip() + "..."
    return cleaned
