import { tauriWindowApi } from '@/shared/api/tauri';
import { useCallback, useEffect, useState } from 'react';

export function useWindowControls() {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const checkState = async () => {
      const maximized = await tauriWindowApi.isMaximized();
      if (mounted) setIsMaximized(maximized);
    };
    void checkState();
    const interval = setInterval(checkState, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const minimize = useCallback(async () => {
    await tauriWindowApi.minimize();
  }, []);

  const toggleMaximize = useCallback(async () => {
    await tauriWindowApi.toggleMaximize();
    const maximized = await tauriWindowApi.isMaximized();
    setIsMaximized(maximized);
  }, []);

  const close = useCallback(async () => {
    await tauriWindowApi.close();
  }, []);

  return {
    isMaximized,
    minimize,
    toggleMaximize,
    close,
  };
}
