import { spawn } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Desktop MCP Server (JSON-RPC 2.0 stdio)', () => {
  const mcpServerPath = path.resolve(__dirname, '../scripts/cosmolost-mcp-server.mjs');

  function callMcpTool(toolName: string, toolArgs: Record<string, unknown> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [mcpServerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdoutData = '';

      child.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
        const lines = stdoutData.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.id === 1) {
              child.kill();
              if (parsed.result?.content?.[0]?.text) {
                resolve(JSON.parse(parsed.result.content[0].text));
              } else {
                resolve(parsed.result);
              }
              return;
            }
          } catch {
            // Buffer partial JSON line
          }
        }
      });

      child.stderr.on('data', (err) => {
        console.error('MCP server stderr:', err.toString());
      });

      child.on('error', reject);

      const request = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArgs,
        },
      });

      child.stdin.write(`${request}\n`);
    });
  }

  it('handles search_artifacts tool', async () => {
    const res = await callMcpTool('search_artifacts', {
      query: 'Opportunity',
      celestial_body: 'mars',
    });

    expect(res.total).toBeGreaterThanOrEqual(1);
    expect(res.results[0].id).toBe('opportunity-rover');
    expect(res.results[0].type).toBe('ROVER');
  });

  it('handles create_video_task tool', async () => {
    const res = await callMcpTool('create_video_task', {
      artifact_id: 'opportunity-rover',
      rubric_id: 'last-sol-drama',
      language: 'uk',
    });

    expect(res.success).toBe(true);
    expect(res.taskId).toBeDefined();
    expect(res.artifactId).toBe('opportunity-rover');
    expect(res.status).toBe('QUEUED');
    expect(res.targetDurationSec).toBe(40);
  });

  it('handles get_render_status tool', async () => {
    const res = await callMcpTool('get_render_status', {
      task_id: 'task_sample_123',
    });

    expect(res.taskId).toBe('task_sample_123');
    expect(res.status).toBe('COMPLETED');
    expect(res.progressPct).toBe(100);
    expect(res.outputFilePath).toContain('task_sample_123.mp4');
  });

  it('handles trigger_social_publish tool with local folder exporter', async () => {
    const res = await callMcpTool('trigger_social_publish', {
      task_id: 'task_sample_123',
      platform: 'LOCAL_FOLDER',
    });

    expect(res.success).toBe(true);
    expect(res.platform).toBe('LOCAL_FOLDER');
    expect(res.seoBundleCopiedToClipboard).toBe(true);
  });

  it('handles batch_generate_rubric tool', async () => {
    const res = await callMcpTool('batch_generate_rubric', {
      rubric_id: 'tech-explain',
      count: 5,
    });

    expect(res.success).toBe(true);
    expect(res.rubricId).toBe('tech-explain');
    expect(res.totalTasks).toBe(5);
    expect(res.tasks.length).toBe(5);
    expect(res.concurrencyLimit).toBe(2);
  });

  it('handles cosmolost_cli_intercept tool', async () => {
    const res = await callMcpTool('cosmolost_cli_intercept', {
      command: 'cosmolost ping',
    });

    expect(res.success).toBe(true);
    expect(res.command).toBe('cosmolost ping');
    expect(res.output).toContain('pong');
    expect(res.exitCode).toBe(0);
  });

  it('handles cosmolost_multi_llm_query and image generation tools', async () => {
    const llmRes = await callMcpTool('cosmolost_multi_llm_query', {
      prompt: 'Summarize Opportunity Rover sol 5111',
      provider: 'claude',
    });

    expect(llmRes.success).toBe(true);
    expect(llmRes.provider).toBe('claude');
    expect(llmRes.text).toBeDefined();

    const imgRes = await callMcpTool('cosmolost_generate_image', {
      prompt: 'Opportunity Rover sunset on Mars',
      provider: 'pollinations-free',
    });

    expect(imgRes.success).toBe(true);
    expect(imgRes.imageUrl).toContain('pollinations.ai');

    const statusRes = await callMcpTool('cosmolost_get_cli_integrations_status', {});
    expect(statusRes.bridgeActive).toBe(true);
    expect(statusRes.readyForExternalClis).toBe(true);
  });
});
