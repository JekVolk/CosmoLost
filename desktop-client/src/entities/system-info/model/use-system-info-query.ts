import { useQuery } from '@tanstack/react-query';
import { systemInfoRepository } from '../api/system-info-repository';
import { useSystemInfoStore } from './system-info-store';
import type { SystemInfoModel } from './types';

export const SYSTEM_INFO_QUERY_KEY = ['system-info'] as const;

export function useSystemInfoQuery() {
  const setCachedMetrics = useSystemInfoStore((state) => state.setCachedMetrics);

  return useQuery<SystemInfoModel, Error>({
    queryKey: SYSTEM_INFO_QUERY_KEY,
    queryFn: async () => {
      const data = await systemInfoRepository.getMetrics();
      setCachedMetrics(data);
      return data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
