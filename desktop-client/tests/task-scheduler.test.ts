import { describe, expect, it, vi } from 'vitest';
import {
  CacheCleanTaskExecutor,
  CustomTaskExecutor,
  PingTaskExecutor,
  SystemInfoTaskExecutor,
  taskExecutorRegistry,
} from '../src/features/task-scheduler/model/task-executors';
import { schedulerService } from '../src/shared/lib/scheduler/scheduler-service';

describe('Task Scheduler Engine & Strategy Registry', () => {
  it('registers and starts timers without crashing', () => {
    const dummyTask = vi.fn().mockResolvedValue('Done');
    schedulerService.start('test-task-1', 60, dummyTask);

    expect(schedulerService.isScheduled('test-task-1')).toBe(true);
    schedulerService.stop('test-task-1');
    expect(schedulerService.isScheduled('test-task-1')).toBe(false);
  });

  it('runs tasks and triggers onStart and onSuccess listeners', async () => {
    const onStartMock = vi.fn();
    const onSuccessMock = vi.fn();

    const unsubStart = schedulerService.onStart(onStartMock);
    const unsubSuccess = schedulerService.onSuccess(onSuccessMock);

    schedulerService.register('test-run-task', async () => {
      return 'Completed step A';
    });

    await schedulerService.runTask('test-run-task');

    expect(onStartMock).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 'test-run-task' }),
    );
    expect(onSuccessMock).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'test-run-task',
        result: 'Completed step A',
      }),
    );

    unsubStart();
    unsubSuccess();
    schedulerService.unregister('test-run-task');
  });

  it('catches task errors and triggers onError listener without re-throwing', async () => {
    const onErrorMock = vi.fn();
    const unsubError = schedulerService.onError(onErrorMock);

    schedulerService.register('failing-task', async () => {
      throw new Error('Disk timeout error');
    });

    await schedulerService.runTask('failing-task');

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'failing-task',
        error: 'Disk timeout error',
      }),
    );

    unsubError();
    schedulerService.unregister('failing-task');
  });

  describe('Task Executor Strategies', () => {
    it('PingTaskExecutor returns echo message', async () => {
      const executor = new PingTaskExecutor();
      const result = await executor.execute({
        id: 'p1',
        name: 'Heartbeat',
        type: 'ping',
        intervalSec: 10,
        enabled: true,
        status: 'idle',
        lastRunAt: null,
        nextRunAt: null,
        runCount: 0,
        errorCount: 0,
        lastDurationMs: null,
        lastResult: null,
      });

      expect(result).toContain('Echo');
      expect(result).toContain('Heartbeat');
    });

    it('SystemInfoTaskExecutor returns platform details', async () => {
      const executor = new SystemInfoTaskExecutor();
      const result = await executor.execute();

      expect(result).toContain('OS:');
      expect(result).toContain('App: v');
    });

    it('CacheCleanTaskExecutor returns sweep summary', async () => {
      const executor = new CacheCleanTaskExecutor();
      const result = await executor.execute();

      expect(result).toContain('Cache swept');
    });

    it('CustomTaskExecutor executes fallback safely', async () => {
      const executor = new CustomTaskExecutor();
      const result = await executor.execute({
        id: 'c1',
        name: 'Cleanup Scratch',
        type: 'custom',
        intervalSec: 30,
        enabled: true,
        status: 'idle',
        lastRunAt: null,
        nextRunAt: null,
        runCount: 0,
        errorCount: 0,
        lastDurationMs: null,
        lastResult: null,
      });

      expect(result).toContain('Custom routine [Cleanup Scratch]');
    });

    it('Registry resolves correct executor for known types', () => {
      const pingExec = taskExecutorRegistry.get('ping');
      expect(pingExec).toBeInstanceOf(PingTaskExecutor);

      const sysExec = taskExecutorRegistry.get('system-info');
      expect(sysExec).toBeInstanceOf(SystemInfoTaskExecutor);
    });
  });
});
