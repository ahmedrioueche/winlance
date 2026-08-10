import json
import logging
import os
import re
import urllib.request
from django.conf import settings

logger = logging.getLogger(__name__)


def parse_raw_proposal_fallback(raw_text: str) -> dict:
    """Fallback parser when AI key is unavailable."""
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    title = lines[0][:100] if lines else "New Proposal"
    summary = lines[1] if len(lines) > 1 else raw_text[:300]
    body = "\n\n".join(lines[2:]) if len(lines) > 2 else raw_text

    # Extract any dollar amounts in text
    amounts = re.findall(r"\$\s*([0-9,]+(?:\.[0-9]{2})?)", raw_text)
    total_amount = 0.0
    if amounts:
        try:
            total_amount = float(amounts[0].replace(",", ""))
        except ValueError:
            total_amount = 0.0

    return {
        "title": title,
        "summary": summary,
        "body": body,
        "amount": total_amount,
        "currency": "USD",
        "milestones": [
            {
                "title": "Milestone 1: Initial Discovery & Delivery",
                "description": summary[:250],
                "amount": total_amount,
                "deliverables": ["Initial setup", "Core implementation"],
            }
        ],
    }


def smart_import_proposal_text(raw_text: str) -> dict:
    """
    Parses raw pasted text (chat notes, requirements, or full existing proposals)
    into a structured proposal schema with milestones using Gemini AI.
    """
    api_key = (
        getattr(settings, "GEMINI_API_KEY", "")
        or getattr(settings, "GOOGLE_API_KEY", "")
        or os.environ.get("GEMINI_API_KEY", "")
        or os.environ.get("GOOGLE_API_KEY", "")
    )

    if not api_key:
        logger.info("No GEMINI_API_KEY configured for smart import. Using fallback parser.")
        return parse_raw_proposal_fallback(raw_text)

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

        prompt = (
            "You are an expert freelance proposal software assistant. "
            "Analyze the following raw text (which may be client call notes, project requirements, or an existing proposal draft) "
            "and convert it into a structured proposal breakdown with sequential milestone phases.\n\n"
            "Raw Text Input:\n"
            f"{raw_text}\n\n"
            "Requirements:\n"
            "1. Extract an executive title and concise summary.\n"
            "2. Extract or estimate total budget amount (number) and currency (3-letter code, default USD).\n"
            "3. Extract or logically group deliverables into 1 to 4 sequential milestone phases (title, description, phase budget amount, and bullet array of deliverables).\n"
            "4. Put general terms, approach, or next steps in 'body'."
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "OBJECT",
                    "properties": {
                        "title": {"type": "STRING"},
                        "summary": {"type": "STRING"},
                        "body": {"type": "STRING"},
                        "amount": {"type": "NUMBER"},
                        "currency": {"type": "STRING"},
                        "milestones": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": {"type": "STRING"},
                                    "description": {"type": "STRING"},
                                    "amount": {"type": "NUMBER"},
                                    "deliverables": {
                                        "type": "ARRAY",
                                        "items": {"type": "STRING"},
                                    },
                                },
                                "required": ["title", "description", "amount", "deliverables"],
                            },
                        },
                    },
                    "required": ["title", "summary", "body", "amount", "currency", "milestones"],
                },
            },
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            raw_json = (
                res_data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "{}")
            )
            parsed = json.loads(raw_json)
            if isinstance(parsed, dict) and "title" in parsed:
                return parsed

    except Exception as exc:
        logger.warning("Gemini AI smart import failed (%s). Using fallback parser.", exc)

    return parse_raw_proposal_fallback(raw_text)
