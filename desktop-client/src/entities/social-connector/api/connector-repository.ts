import type { ConnectionStatus, ConnectorPlatformType } from '@/shared/api';
import type { ConnectorItem, ISocialConnectorRepository } from '../model/types';
import { connectorApi } from './connector-api';

export class SocialConnectorRepository implements ISocialConnectorRepository {
  async getConnectors(): Promise<ConnectorItem[]> {
    const rawList = await connectorApi.fetchConnectors();
    return rawList.map((c) => ({
      id: c.id,
      platformType: c.platform_type as ConnectorPlatformType,
      displayName: c.display_name,
      authType: c.auth_type,
      status: c.connection_status as ConnectionStatus,
      isActive: c.is_active,
      lastConnectedAt: c.last_connected_at,
    }));
  }

  async toggleConnector(_id: string, _active: boolean): Promise<void> {
    // In production, persists toggled channels to Tauri store
  }
}

export const socialConnectorRepository = new SocialConnectorRepository();
