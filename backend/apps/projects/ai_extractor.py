import json
import logging
import os
import re
import urllib.parse
import urllib.request
from django.conf import settings

logger = logging.getLogger(__name__)


def parse_markdown_milestones_fallback(title: str, summary: str, body: str) -> list[dict]:
    """
    Deterministic fallback parser for proposal text when AI key is unconfigured or offline.
    Groups bullet points under markdown headers as Milestone phases with nested Tasks.
    """
    milestones = []
    lines = body.splitlines()

    header_pattern = re.compile(r"^\s*#{1,6}\s+(.+)")
    bullet_pattern = re.compile(r"^\s*(?:[\*\-\+]|\d+\.)\s+(?:\[[\sXx]\]\s*)?(.+)")

    current_milestone_title = ""
    current_tasks = []
    m_order = 1
    global_t_order = 1

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        header_match = header_pattern.match(stripped)
        if header_match:
            # Save previous milestone if it had tasks
            if current_milestone_title and current_tasks:
                milestones.append({
                    "title": current_milestone_title[:255],
                    "description": "",
                    "order": m_order,
                    "tasks": current_tasks,
                })
                m_order += 1
                current_tasks = []

            current_milestone_title = header_match.group(1).strip()
            continue

        bullet_match = bullet_pattern.match(stripped)
        if bullet_match:
            item_text = bullet_match.group(1).strip()
            if item_text:
                if not current_milestone_title:
                    current_milestone_title = "Phase 1: Initial Deliverables"
                current_tasks.append({
                    "title": item_text[:255],
                    "description": "",
                    "priority": "MEDIUM",
                    "due_date": None,
                    "order": global_t_order,
                })
                global_t_order += 1

    # Save last milestone
    if current_milestone_title and current_tasks:
        milestones.append({
            "title": current_milestone_title[:255],
            "description": "",
            "order": m_order,
            "tasks": current_tasks,
        })

    return milestones


def extract_milestones_and_tasks_from_proposal(title: str, summary: str, body: str) -> list[dict]:
    """
    Extracts structured project Milestones (phases) and associated Tasks from proposal text.
    Uses Gemini API if GEMINI_API_KEY / GOOGLE_API_KEY is configured, else falls back to local parser.
    Returns a list of milestone dicts, each containing a list of task dicts.
    """
    api_key = (
        getattr(settings, "GEMINI_API_KEY", "")
        or getattr(settings, "GOOGLE_API_KEY", "")
        or os.environ.get("GEMINI_API_KEY", "")
        or os.environ.get("GOOGLE_API_KEY", "")
    )

    if not api_key or getattr(settings, "TESTING", False) or api_key in {"dummy", "test", "fake"}:
        logger.info("No GEMINI_API_KEY configured. Using deterministic Markdown milestone parser.")
        return parse_markdown_milestones_fallback(title, summary, body)

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"

        prompt = (
            "Parse the following proposal title, summary, and body into structured project Milestone Phases with actionable Tasks.\n"
            "Group tasks under logical milestone phases (e.g. Phase 1: Setup & Discovery, Phase 2: Core Development, Phase 3: Testing & Launch).\n"
            "For each milestone, extract title and description.\n"
            "For each task inside a milestone, extract a concise title, description, priority (LOW, MEDIUM, HIGH, or URGENT), "
            "and an estimated due date in YYYY-MM-DD format if dates are mentioned (or null if unstated).\n\n"
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
                            "tasks": {
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
                        "required": ["title", "tasks"],
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

        with urllib.request.urlopen(req, timeout=3) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            raw_text = (
                res_data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "[]")
            )
            parsed = json.loads(raw_text)

            milestones = []
            global_t_order = 1
            for m_idx, m_item in enumerate(parsed, start=1):
                raw_tasks = m_item.get("tasks", [])
                tasks = []
                for t_item in raw_tasks:
                    tasks.append({
                        "title": str(t_item.get("title", "Task"))[:255],
                        "description": str(t_item.get("description", "")),
                        "priority": t_item.get("priority", "MEDIUM") if t_item.get("priority") in {"LOW", "MEDIUM", "HIGH", "URGENT"} else "MEDIUM",
                        "due_date": t_item.get("due_date") if t_item.get("due_date") and re.match(r"^\d{4}-\d{2}-\d{2}$", str(t_item.get("due_date"))) else None,
                        "order": global_t_order,
                    })
                    global_t_order += 1

                if tasks:
                    milestones.append({
                        "title": str(m_item.get("title", f"Phase {m_idx}"))[:255],
                        "description": str(m_item.get("description", "")),
                        "order": m_idx,
                        "tasks": tasks,
                    })

            if milestones:
                return milestones

    except Exception as exc:
        logger.warning("Gemini AI milestone extraction failed (%s). Falling back to Markdown parser.", exc)

    return parse_markdown_milestones_fallback(title, summary, body)


def extract_tasks_from_proposal(title: str, summary: str, body: str) -> list[dict]:
    """Backwards compatible function returning flattened tasks."""
    structured = extract_milestones_and_tasks_from_proposal(title, summary, body)
    flat_tasks = []
    order = 1
    for m in structured:
        for t in m.get("tasks", []):
            task_copy = dict(t)
            task_copy["order"] = order
            flat_tasks.append(task_copy)
            order += 1
    return flat_tasks
