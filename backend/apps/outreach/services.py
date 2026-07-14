import re

from django.db.models import Q
from django.utils.text import slugify
from rest_framework.exceptions import ValidationError

from .models import Checklist, ChecklistItem, Sequence, SequenceStep, Tag, Template

PLACEHOLDER_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")


def render_outreach_content(content, context):
    def replace(match):
        key = match.group(1)
        value = context.get(key, "")
        return "" if value is None else str(value)

    return PLACEHOLDER_PATTERN.sub(replace, content)


def _tag_filter(queryset, tag):
    if tag.isdigit():
        return queryset.filter(tags__id=int(tag)).distinct()
    return queryset.filter(tags__slug=tag).distinct()


def apply_template_filters(queryset, params):
    type_filter = params.get("type")
    if type_filter:
        queryset = queryset.filter(type=type_filter)

    tag = params.get("tag")
    if tag:
        queryset = _tag_filter(queryset, tag)

    playbook = params.get("is_playbook")
    if playbook is not None and playbook != "":
        queryset = queryset.filter(is_playbook=playbook.lower() == "true")

    q = (params.get("q") or "").strip()
    if q:
        queryset = queryset.filter(
            Q(title__icontains=q) | Q(content__icontains=q)
        ).distinct()

    return queryset


def apply_sequence_filters(queryset, params):
    tag = params.get("tag")
    if tag:
        queryset = _tag_filter(queryset, tag)

    playbook = params.get("is_playbook")
    if playbook is not None and playbook != "":
        queryset = queryset.filter(is_playbook=playbook.lower() == "true")

    q = (params.get("q") or "").strip()
    if q:
        queryset = queryset.filter(
            Q(title__icontains=q) | Q(description__icontains=q)
        ).distinct()

    return queryset


def get_or_create_tags_for_user(user, tag_names):
    tags = []
    for raw in tag_names:
        name = (raw or "").strip()
        if not name:
            continue
        slug = slugify(name)[:255] or "tag"
        tag, _ = Tag.objects.get_or_create(
            user=user,
            slug=slug,
            defaults={"name": name},
        )
        if tag.name != name:
            tag.name = name
            tag.save(update_fields=["name", "updated_at"])
        tags.append(tag)
    return tags


def add_sequence_step(sequence, template, *, step_number=None, delay_days=0, notes=""):
    if template.user_id and sequence.user_id and template.user_id != sequence.user_id:
        raise ValidationError({"template": "Template must belong to the same user."})

    if step_number is None:
        last = sequence.steps.order_by("-step_number").first()
        step_number = (last.step_number + 1) if last else 1

    if sequence.steps.filter(step_number=step_number).exists():
        raise ValidationError({"step_number": "Step number already exists in this sequence."})

    return SequenceStep.objects.create(
        sequence=sequence,
        template=template,
        step_number=step_number,
        delay_days=delay_days,
        notes=notes or "",
    )


def duplicate_template(template, user):
    clone = Template.objects.create(
        user=user,
        title=f"{template.title} (copy)",
        content=template.content,
        type=template.type,
        is_playbook=template.is_playbook,
    )
    clone.tags.set(template.tags.filter(Q(user=user) | Q(user__isnull=True)))
    return clone


def build_playbook_summary(user):
    return {
        "templates": Template.objects.filter(Q(user=user) | Q(user__isnull=True)).count(),
        "sequences": Sequence.objects.filter(Q(user=user) | Q(user__isnull=True)).count(),
        "checklists": Checklist.objects.filter(Q(user=user) | Q(user__isnull=True)).count(),
        "tags": Tag.objects.filter(Q(user=user) | Q(user__isnull=True)).count(),
        "playbook_templates": Template.objects.filter(
            Q(user=user) | Q(user__isnull=True), is_playbook=True
        ).count(),
        "playbook_sequences": Sequence.objects.filter(
            Q(user=user) | Q(user__isnull=True), is_playbook=True
        ).count(),
    }


def ensure_checklist_item(checklist, content, order=0):
    return ChecklistItem.objects.create(
        checklist=checklist,
        content=content,
        order=order,
    )
