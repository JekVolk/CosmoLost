export interface SystemInfoModel {
  osName: string;
  arch: string;
  appVersion: string;
  status: 'online' | 'degraded' | 'offline';
  loadedAt: string;
}

export interface ISystemInfoRepository {
  getMetrics(): Promise<SystemInfoModel>;
}
