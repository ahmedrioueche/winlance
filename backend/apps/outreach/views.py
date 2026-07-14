from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Checklist, ChecklistItem, Sequence, SequenceStep, Tag, Template
from .serializers import (
    ChecklistItemSerializer,
    ChecklistSerializer,
    SequenceSerializer,
    SequenceStepCreateSerializer,
    SequenceStepSerializer,
    TagSerializer,
    TemplateRenderSerializer,
    TemplateSerializer,
)
from .services import (
    add_sequence_step,
    apply_sequence_filters,
    apply_template_filters,
    build_playbook_summary,
    duplicate_template,
    render_outreach_content,
)


class TagViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()

    def get_queryset(self):
        return self.queryset.filter(Q(user=self.request.user) | Q(user__isnull=True))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        tag = self.get_object()
        if tag.user_id is None:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("System tags cannot be edited.")
        if tag.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Cannot delete this tag.")
        instance.delete()


class TemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TemplateSerializer
    queryset = Template.objects.prefetch_related("tags")

    def get_queryset(self):
        qs = self.queryset.filter(Q(user=self.request.user) | Q(user__isnull=True))
        return apply_template_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        template = self.get_object()
        if template.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Cannot edit system or other users' templates.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Cannot delete this template.")
        instance.delete()

    @action(detail=True, methods=["post"], url_path="render", url_name="render")
    def render(self, request, pk=None):
        template = self.get_object()
        serializer = TemplateRenderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        context = {
            **serializer.validated_data,
            "freelancer_name": serializer.validated_data.get("freelancer_name")
            or (request.user.get_full_name() or request.user.username),
        }
        return Response(
            {
                "title": template.title,
                "type": template.type,
                "rendered": render_outreach_content(template.content, context),
            }
        )

    @action(detail=True, methods=["post"], url_path="duplicate", url_name="duplicate")
    def duplicate(self, request, pk=None):
        template = self.get_object()
        clone = duplicate_template(template, request.user)
        return Response(
            TemplateSerializer(clone, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class SequenceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SequenceSerializer
    queryset = Sequence.objects.prefetch_related("steps__template", "tags")

    def get_queryset(self):
        qs = self.queryset.filter(Q(user=self.request.user) | Q(user__isnull=True))
        return apply_sequence_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        sequence = self.get_object()
        if sequence.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied()
        instance.delete()

    @action(detail=True, methods=["post"], url_path="steps", url_name="add-step")
    def add_step(self, request, pk=None):
        sequence = self.get_object()
        if sequence.user_id != request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied()
        serializer = SequenceStepCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        template = Template.objects.filter(
            Q(id=serializer.validated_data["template_id"]),
            Q(user=request.user) | Q(user__isnull=True),
        ).first()
        if not template:
            return Response(
                {"error": {"message": "Template not found.", "status_code": 400}},
                status=400,
            )
        step = add_sequence_step(
            sequence,
            template,
            step_number=serializer.validated_data.get("step_number"),
            delay_days=serializer.validated_data.get("delay_days", 0),
            notes=serializer.validated_data.get("notes", ""),
        )
        return Response(
            SequenceStepSerializer(step, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class SequenceStepViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SequenceStepSerializer
    http_method_names = ["get", "patch", "put", "delete", "head", "options"]
    queryset = SequenceStep.objects.select_related("template", "sequence")

    def get_queryset(self):
        return self.queryset.filter(sequence__user=self.request.user)


class ChecklistViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChecklistSerializer
    queryset = Checklist.objects.prefetch_related("items", "tags")

    def get_queryset(self):
        qs = self.queryset.filter(Q(user=self.request.user) | Q(user__isnull=True))
        tag = self.request.query_params.get("tag")
        if tag:
            from .services import _tag_filter

            qs = _tag_filter(qs, tag)
        playbook = self.request.query_params.get("is_playbook")
        if playbook is not None and playbook != "":
            qs = qs.filter(is_playbook=playbook.lower() == "true")
        q = (self.request.query_params.get("q") or "").strip()
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q)).distinct()
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        checklist = self.get_object()
        if checklist.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied()
        instance.delete()

    @action(detail=True, methods=["post"], url_path="items", url_name="add-item")
    def add_item(self, request, pk=None):
        checklist = self.get_object()
        if checklist.user_id != request.user.id:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied()
        serializer = ChecklistItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = ChecklistItem.objects.create(
            checklist=checklist,
            content=serializer.validated_data["content"],
            order=serializer.validated_data.get("order", 0),
            is_done_default=serializer.validated_data.get("is_done_default", False),
        )
        return Response(
            ChecklistItemSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )


class ChecklistItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChecklistItemSerializer
    http_method_names = ["get", "patch", "put", "delete", "head", "options"]
    queryset = ChecklistItem.objects.select_related("checklist")

    def get_queryset(self):
        return self.queryset.filter(checklist__user=self.request.user)


class PlaybookViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response(build_playbook_summary(request.user))
