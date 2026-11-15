import { type PingResponse, type SystemInfo, tauriCommands } from '@/shared/api';
import { useDiagnosticsStore } from '@/shared/lib/diagnostics';
import { useState } from 'react';

export interface IpcLogEntry {
  command: string;
  status: 'success' | 'error';
  timestamp: string;
  durationMs: number;
  response: string;
}

export function useIpcBridge() {
  const [logs, setLogs] = useState<IpcLogEntry[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const { addError } = useDiagnosticsStore();

  const handleTestPing = async () => {
    setIsPending(true);
    const start = performance.now();
    try {
      const res: PingResponse = await tauriCommands.ping('Hello from React Frontend');
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      setLogs((prev) => [
        {
          command: 'ping("Hello from React Frontend")',
          status: 'success',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const errMsg = err instanceof Error ? err.message : String(err);
      addError('Tauri IPC', `ping failed: ${errMsg}`);
      setLogs((prev) => [
        {
          command: 'ping("Hello from React Frontend")',
          status: 'error',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: `Error: ${errMsg}`,
        },
        ...prev.slice(0, 19),
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
          status: 'success',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const errMsg = err instanceof Error ? err.message : String(err);
      addError('Tauri IPC', `get_system_info failed: ${errMsg}`);
      setLogs((prev) => [
        {
          command: 'get_system_info()',
          status: 'error',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: `Error: ${errMsg}`,
        },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleTestClipboard = async () => {
    setIsPending(true);
    const start = performance.now();
    try {
      const res = await tauriCommands.copyToClipboard(
        'CosmoLost Diagnostic Payload: OK',
        'SEO_BUNDLE',
      );
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      setLogs((prev) => [
        {
          command: 'copy_to_clipboard("CosmoLost Diagnostic Payload: OK")',
          status: 'success',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const errMsg = err instanceof Error ? err.message : String(err);
      addError('Tauri IPC', `copy_to_clipboard failed: ${errMsg}`);
      setLogs((prev) => [
        {
          command: 'copy_to_clipboard()',
          status: 'error',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: `Error: ${errMsg}`,
        },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleTestFolder = async () => {
    setIsPending(true);
    const start = performance.now();
    try {
      const res = await tauriCommands.openFolderWithVideo('diag-test-project');
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      setLogs((prev) => [
        {
          command: 'open_folder_with_video("diag-test-project")',
          status: 'success',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: JSON.stringify(res, null, 2),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const errMsg = err instanceof Error ? err.message : String(err);
      addError('Tauri IPC', `open_folder_with_video failed: ${errMsg}`);
      setLogs((prev) => [
        {
          command: 'open_folder_with_video()',
          status: 'error',
          timestamp: new Date().toLocaleTimeString(),
          durationMs,
          response: `Error: ${errMsg}`,
        },
        ...prev.slice(0, 19),
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
    handleTestClipboard,
    handleTestFolder,
    clearLogs: () => setLogs([]),
  };
}
