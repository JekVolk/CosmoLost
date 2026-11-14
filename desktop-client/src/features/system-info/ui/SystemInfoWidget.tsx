import { SystemInfoCardView, useSystemInfoQuery } from '@/entities/system-info';
import type React from 'react';

export const SystemInfoWidget: React.FC = () => {
  const { data, isLoading, error } = useSystemInfoQuery();

  return <SystemInfoCardView metrics={data ?? null} isLoading={isLoading} error={error} />;
};
