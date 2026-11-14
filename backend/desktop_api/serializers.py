from rest_framework import serializers
from core.models import Artifact


class SlideStructureSerializer(serializers.Serializer):
    slide_index = serializers.IntegerField()
    type = serializers.CharField()
    duration_sec = serializers.FloatField()
    safe_zone_layout = serializers.CharField()


class ContentTemplateSerializer(serializers.Serializer):
    id = serializers.CharField()
    rubric_name = serializers.CharField()
    target_duration_sec = serializers.IntegerField()
    safe_zone_preset = serializers.CharField(required=False, default='PILLOWBOX_9_16')
    slide_structure = SlideStructureSerializer(many=True)


class TtsScriptSerializer(serializers.Serializer):
    uk = serializers.CharField()
    en = serializers.CharField()


class SeoCaptionSerializer(serializers.Serializer):
    line1_hook = serializers.CharField()
    line2_seo = serializers.CharField()
    line3_tags = serializers.CharField()


class EditorAssetBundleSerializer(serializers.Serializer):
    artifact_id = serializers.CharField()
    name = serializers.CharField()
    tts_script = TtsScriptSerializer()
    seo_caption = SeoCaptionSerializer()
    pin_comment = serializers.CharField()
    high_res_photos = serializers.ListField(child=serializers.URLField())
    model_3d_glb_url = serializers.URLField(allow_null=True, required=False)


class RecommendNextTopicRequestSerializer(serializers.Serializer):
    current_artifact_id = serializers.CharField(required=True)
    rubric_id = serializers.CharField(required=True)
    selection_reason = serializers.CharField(required=True, min_length=10, max_length=500)

    def validate_current_artifact_id(self, value):
        if not Artifact.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"Artifact with id '{value}' does not exist.")
        return value


class RecommendNextTopicResponseSerializer(serializers.Serializer):
    suggested_artifact_id = serializers.CharField()
    suggested_artifact_name = serializers.CharField()
    narrative_bridge = serializers.CharField()
    suggested_hook = serializers.CharField()
    suggested_rubric_id = serializers.CharField()
    recommended_pin_comment = serializers.CharField()
