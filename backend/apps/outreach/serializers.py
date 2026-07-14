from rest_framework import serializers

from .models import Checklist, ChecklistItem, Sequence, SequenceStep, Tag, Template
from .services import get_or_create_tags_for_user


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "user", "name", "slug", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "slug", "created_at", "updated_at"]


class TemplateSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Template
        fields = [
            "id",
            "user",
            "title",
            "content",
            "type",
            "tags",
            "tag_names",
            "is_playbook",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        template = Template.objects.create(**validated_data)
        if tag_names:
            tags = get_or_create_tags_for_user(validated_data["user"], tag_names)
            template.tags.set(tags)
        return template

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            tags = get_or_create_tags_for_user(instance.user, tag_names)
            instance.tags.set(tags)
        return instance


class SequenceStepSerializer(serializers.ModelSerializer):
    template_detail = TemplateSerializer(source="template", read_only=True)

    class Meta:
        model = SequenceStep
        fields = [
            "id",
            "sequence",
            "template",
            "template_detail",
            "step_number",
            "delay_days",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "sequence", "created_at", "updated_at"]


class SequenceSerializer(serializers.ModelSerializer):
    steps = SequenceStepSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Sequence
        fields = [
            "id",
            "user",
            "title",
            "description",
            "tags",
            "tag_names",
            "is_playbook",
            "steps",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        sequence = Sequence.objects.create(**validated_data)
        if tag_names:
            sequence.tags.set(get_or_create_tags_for_user(validated_data["user"], tag_names))
        return sequence

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            instance.tags.set(get_or_create_tags_for_user(instance.user, tag_names))
        return instance


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = [
            "id",
            "checklist",
            "content",
            "order",
            "is_done_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "checklist", "created_at", "updated_at"]


class ChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Checklist
        fields = [
            "id",
            "user",
            "title",
            "description",
            "tags",
            "tag_names",
            "is_playbook",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        checklist = Checklist.objects.create(**validated_data)
        if tag_names:
            checklist.tags.set(get_or_create_tags_for_user(validated_data["user"], tag_names))
        return checklist

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            instance.tags.set(get_or_create_tags_for_user(instance.user, tag_names))
        return instance


class TemplateRenderSerializer(serializers.Serializer):
    client_name = serializers.CharField(required=False, allow_blank=True, default="")
    company = serializers.CharField(required=False, allow_blank=True, default="")
    title = serializers.CharField(required=False, allow_blank=True, default="")
    freelancer_name = serializers.CharField(required=False, allow_blank=True, default="")


class SequenceStepCreateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    step_number = serializers.IntegerField(required=False, min_value=1)
    delay_days = serializers.IntegerField(required=False, default=0, min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
