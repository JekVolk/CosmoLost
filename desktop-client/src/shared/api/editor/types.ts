/**
 * CosmoLost Editor & FastMCP API DTOs (from openapi_editor.json)
 */

export type SafeZonePreset = 'PILLOWBOX_9_16' | 'FULLSCREEN_VERTICAL' | 'BOX_1_1';

export type SlideStructureType = 'HOOK' | 'B_ROLL_FACTS' | 'DRAMA_PEAK' | 'SEAMLESS_LOOP_CTA';

export interface SlideStructureItem {
  slide_index: number;
  type: SlideStructureType;
  duration_sec: number;
  safe_zone_layout: string;
}

export interface ContentTemplate {
  id: string;
  rubric_name: string;
  target_duration_sec: number;
  safe_zone_preset: string;
  slide_structure: SlideStructureItem[];
}

export interface EditorAssetBundle {
  artifact_id: string;
  name: string;
  tts_script: {
    uk: string;
    en: string;
  };
  seo_caption: {
    line1_hook: string;
    line2_seo: string;
    line3_tags: string;
  };
  pin_comment: string;
  high_res_photos: string[];
  model_3d_glb_url?: string | null;
}

export interface RecommendNextTopicRequest {
  current_artifact_id: string;
  rubric_id: string;
  selection_reason?: string;
}

export interface RecommendNextTopicResponse {
  suggested_artifact_id: string;
  suggested_artifact_name: string;
  narrative_bridge: string;
  suggested_hook: string;
  suggested_rubric_id: string;
  recommended_pin_comment: string;
}

export interface NasaCatalogSyncRequest {
  force?: boolean;
  dry_run?: boolean;
  target_body?: string;
}

export interface NasaCatalogSyncResponse {
  status: string;
  synced_records: number;
  duration_sec: number;
}
