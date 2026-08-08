import json
import logging
import os
import re
import urllib.parse
import urllib.request
from django.conf import settings

logger = logging.getLogger(__name__)


def parse_markdown_tasks_fallback(title: str, summary: str, body: str) -> list[dict]:
    """Deterministic fallback parser for proposal text when AI key is unconfigured or offline."""
    tasks = []
    lines = body.splitlines()
    order = 1

    bullet_pattern = re.compile(r"^\s*(?:[\*\-\+]|\d+\.)\s+(?:\[[\sXx]\]\s*)?(.+)")
    header_pattern = re.compile(r"^\s*#{1,6}\s+(.+)")

    current_section = ""

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        header_match = header_pattern.match(stripped)
        if header_match:
            current_section = header_match.group(1).strip()
            continue

        bullet_match = bullet_pattern.match(stripped)
        if bullet_match:
            item_text = bullet_match.group(1).strip()
            if item_text:
                desc = f"Section: {current_section}" if current_section else ""
                tasks.append(
                    {
                        "title": item_text[:255],
                        "description": desc,
                        "priority": "MEDIUM",
                        "due_date": None,
                        "order": order,
                    }
                )
                order += 1

    if not tasks:
        # Fallback to single primary task if no bullet items were parsed
        tasks.append(
            {
                "title": f"Execute Deliverables: {title}"[:255],
                "description": summary or body[:500] or "Project scope execution.",
                "priority": "HIGH",
                "due_date": None,
                "order": 1,
            }
        )

    return tasks


def extract_tasks_from_proposal(title: str, summary: str, body: str) -> list[dict]:
    """
    Extracts structured project tasks from proposal text.
    Uses Gemini API if GEMINI_API_KEY / GOOGLE_API_KEY is configured, else falls back to local parser.
    """
    api_key = (
        getattr(settings, "GEMINI_API_KEY", "")
        or getattr(settings, "GOOGLE_API_KEY", "")
        or os.environ.get("GEMINI_API_KEY", "")
        or os.environ.get("GOOGLE_API_KEY", "")
    )

    if not api_key:
        logger.info("No GEMINI_API_KEY configured. Using deterministic Markdown task parser.")
        return parse_markdown_tasks_fallback(title, summary, body)

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        prompt = (
            "Parse the following proposal title, summary, and body into a structured list of actionable project tasks.\n"
            "For each task, extract a concise title, detailed description, priority (LOW, MEDIUM, HIGH, or URGENT), "
            "and an estimated due date in YYYY-MM-DD format if dates or milestones are present in the text (or null if unstated).\n\n"
            f"Proposal Title: {title}\n"
            f"Proposal Summary: {summary}\n\n"
            f"Proposal Scope & Body:\n{body}"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "title": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "priority": {
                                "type": "STRING",
                                "enum": ["LOW", "MEDIUM", "HIGH", "URGENT"],
                            },
                            "due_date": {"type": "STRING"},
                        },
                        "required": ["title", "description", "priority"],
                    },
                },
            },
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            raw_text = (
                res_data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "[]")
            )
            parsed = json.loads(raw_text)

            tasks = []
            for i, item in enumerate(parsed, start=1):
                tasks.append(
                    {
                        "title": str(item.get("title", "Task"))[:255],
                        "description": str(item.get("description", "")),
                        "priority": item.get("priority", "MEDIUM") if item.get("priority") in {"LOW", "MEDIUM", "HIGH", "URGENT"} else "MEDIUM",
                        "due_date": item.get("due_date") if item.get("due_date") and re.match(r"^\d{4}-\d{2}-\d{2}$", str(item.get("due_date"))) else None,
                        "order": i,
                    }
                )

            if tasks:
                return tasks

    except Exception as exc:
        logger.warning("Gemini AI task extraction failed (%s). Falling back to Markdown parser.", exc)

    return parse_markdown_tasks_fallback(title, summary, body)
