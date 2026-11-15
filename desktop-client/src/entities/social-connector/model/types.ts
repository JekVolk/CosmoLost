import type { ConnectionStatus, ConnectorPlatformType } from '@/shared/api';

export interface ConnectorItem {
  id: string;
  platformType: ConnectorPlatformType;
  displayName: string;
  authType: string;
  status: ConnectionStatus;
  isActive: boolean;
  lastConnectedAt: string | null;
}

export interface ISocialConnectorRepository {
  getConnectors(): Promise<ConnectorItem[]>;
  toggleConnector(id: string, active: boolean): Promise<void>;
}
