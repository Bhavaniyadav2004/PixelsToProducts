"""Vision AI: analysis and before/after verification. Falls back to a deterministic demo mode without AI_API_KEY."""
import base64
import json
import mimetypes
import re
import zlib

import httpx

from ..config import settings
from ..constants import ISSUE_TYPES
from ..schemas import AIAnalysisResult, AIVerificationResult

ANALYZE_PROMPT = (
    "You analyse photos of urban infrastructure damage. Respond with ONLY a JSON object: "
    '{"issue_type": one of ' + ", ".join(ISSUE_TYPES) + ', "severity": one of LOW, MEDIUM, HIGH, CRITICAL, '
    '"confidence": number 0-1, "description": one short sentence}.'
)
VERIFY_PROMPT = (
    "The first image is BEFORE a repair and the second is AFTER. Judge whether the damage was repaired. "
    'Respond with ONLY a JSON object: {"improvement_detected": boolean, "remaining_damage": boolean, '
    '"confidence": number 0-1, "summary": one or two sentences}.'
)


def _model_url(url: str) -> str:
    """Local dev uploads aren't reachable by a remote model, so inline them."""
    prefix = f"{settings.PUBLIC_BASE_URL}/uploads/"
    if url.startswith(prefix):
        path = settings.UPLOAD_DIR / url[len(prefix):]
        if path.exists():
            mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
            return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"
    return url


def _call_model(prompt: str, image_urls: list[str]) -> dict:
    content = [{"type": "text", "text": prompt}] + [
        {"type": "image_url", "image_url": {"url": _model_url(u)}} for u in image_urls
    ]
    resp = httpx.post(
        f"{settings.AI_BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
        json={"model": settings.AI_MODEL, "messages": [{"role": "user", "content": content}], "temperature": 0.1},
        timeout=60,
    )
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"]
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        raise ValueError("AI response did not contain JSON")
    return json.loads(match.group(0))


def analyze_image(image_url: str, seed: str = "") -> tuple[AIAnalysisResult, dict]:
    if settings.AI_API_KEY:
        try:
            raw = _call_model(ANALYZE_PROMPT, [image_url])
            return AIAnalysisResult(**raw), {"source": "ai", "raw": raw}
        except Exception as exc:  # fall through to demo result, but record why
            err = str(exc)
    else:
        err = "AI_API_KEY not configured"
    h = zlib.crc32((seed or image_url).encode())
    main_types = ISSUE_TYPES[:7]
    issue = main_types[h % len(main_types)]
    severity = ["MEDIUM", "HIGH", "HIGH", "LOW", "CRITICAL"][(h >> 3) % 5]
    result = AIAnalysisResult(
        issue_type=issue, severity=severity, confidence=0.6,
        description=f"Demo estimate (no vision AI available): possible {issue.replace('_', ' ').lower()}.",
    )
    return result, {"source": "demo", "note": err}


def verify_repair(before_url: str, after_url: str) -> tuple[AIVerificationResult, dict]:
    if settings.AI_API_KEY:
        try:
            raw = _call_model(VERIFY_PROMPT, [before_url, after_url])
            return AIVerificationResult(**raw), {"source": "ai", "raw": raw}
        except Exception as exc:
            err = str(exc)
    else:
        err = "AI_API_KEY not configured"
    failed = "fail" in after_url.lower()
    result = AIVerificationResult(
        improvement_detected=not failed,
        remaining_damage=failed,
        confidence=0.6 if failed else 0.85,
        summary="Demo estimate (no vision AI available): "
        + ("damage still appears present." if failed else "the surface appears repaired."),
    )
    return result, {"source": "demo", "note": err}
