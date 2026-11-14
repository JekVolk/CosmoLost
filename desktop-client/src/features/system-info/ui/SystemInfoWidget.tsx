import { useSettingsStore } from '@/entities/settings';
import { SystemInfoCardView, useSystemInfoQuery } from '@/entities/system-info';
import type React from 'react';

export const SystemInfoWidget: React.FC = () => {
  const { autoRefreshMetrics, refreshIntervalSec } = useSettingsStore((state) => state.settings);

  const refetchInterval = autoRefreshMetrics ? refreshIntervalSec * 1000 : false;
  const { data, isLoading, error } = useSystemInfoQuery({ refetchInterval });

  return <SystemInfoCardView metrics={data ?? null} isLoading={isLoading} error={error} />;
};
