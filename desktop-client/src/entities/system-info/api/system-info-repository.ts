import { formatTimestamp } from '@/shared/lib';
import type { ISystemInfoRepository, SystemInfoModel } from '../model/types';
import { systemInfoApi } from './system-info-api';

export class SystemInfoRepository implements ISystemInfoRepository {
  async getMetrics(): Promise<SystemInfoModel> {
    const raw = await systemInfoApi.fetchRawSystemInfo();
    return {
      osName: raw.os_name,
      arch: raw.arch,
      appVersion: raw.app_version,
      status: 'online',
      loadedAt: formatTimestamp(),
    };
  }
}

export const systemInfoRepository = new SystemInfoRepository();
