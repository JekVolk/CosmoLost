import { type PingResponse, type SystemInfo, tauriCommands } from '@/shared/api';
import { useState } from 'react';

export interface IpcLogEntry {
  command: string;
  timestamp: string;
  durationMs: number;
  response: string;
}

export function useIpcBridge() {
  const [logs, setLogs] = useState<IpcLogEntry[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleTestPing = async () => {
    setIsPending(true);
    const start = performance.now();
    try {
      const res: PingResponse = await tauriCommands.ping('Hello from React Frontend');
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      setLogs((prev) => [
        {
          command: 'ping("Hello from React Frontend")',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 8),
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleTestSystemInfo = async () => {
    setIsPending(true);
    const start = performance.now();
    try {
      const res: SystemInfo = await tauriCommands.getSystemInfo();
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      setLogs((prev) => [
        {
          command: 'get_system_info()',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 8),
      ]);
    } finally {
      setIsPending(false);
    }
  };

  return {
    logs,
    isPending,
    handleTestPing,
    handleTestSystemInfo,
    clearLogs: () => setLogs([]),
  };
}
