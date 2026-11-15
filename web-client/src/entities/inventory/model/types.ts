import type { RarityType } from '@/shared/ui';

export interface InventoryItem {
  id: number;
  artifact_id: number;
  name: string;
  rarity: RarityType;
  equipment_class: string;
  obtained_at: string;
}
