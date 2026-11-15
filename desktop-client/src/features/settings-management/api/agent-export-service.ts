import type { AgentProfile } from '@/entities/settings';

/**
 * Formats an AgentProfile as an Antigravity Skill / Claude prompt markdown document with YAML frontmatter.
 */
export function exportAgentSkillMarkdown(agent: AgentProfile): string {
  return `---
name: ${agent.name}
role: ${agent.role}
model: ${agent.model}
temperature: ${agent.temperature}
description: ${agent.description}
enabled: ${agent.enabled}
---

# ${agent.name} (${agent.role})

> ${agent.description}

## System Prompt

\`\`\`markdown
${agent.systemPrompt}
\`\`\`

## Runtime Execution Parameters
- Target Model: \`${agent.model}\`
- Sampling Temperature: \`${agent.temperature}\`
- Client Integration: Compatible with Antigravity CLI (\`agy\`), Claude CLI (\`claude\`), and OpenAI Codex.
`;
}

/**
 * Formats an AgentProfile as portable JSON.
 */
export function exportAgentJson(agent: AgentProfile): string {
  return JSON.stringify(
    {
      version: 1,
      type: 'cosmolost-agent-profile',
      exportedAt: new Date().toISOString(),
      agent,
    },
    null,
    2,
  );
}

/**
 * Formats all agent profiles as a unified multi-agent workspace bundle.
 */
export function exportAllAgentsBundle(agents: AgentProfile[]): string {
  return JSON.stringify(
    {
      version: 1,
      type: 'cosmolost-multi-agent-bundle',
      exportedAt: new Date().toISOString(),
      agentsCount: agents.length,
      agents,
    },
    null,
    2,
  );
}

/**
 * Native cross-platform download trigger using Blob & ObjectURL.
 * shortcut: headless test environments lack document.body.appendChild, fallback gracefully.
 */
export function triggerDownload(content: string, filename: string, mimeType: string): boolean {
  if (typeof document === 'undefined' || !document.createElement) {
    return false;
  }

  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convenience 1-click download for an agent profile.
 */
export function downloadAgent(
  agent: AgentProfile,
  format: 'markdown' | 'json' = 'markdown',
): boolean {
  if (format === 'json') {
    return triggerDownload(
      exportAgentJson(agent),
      `${agent.id}-agent.json`,
      'application/json;charset=utf-8',
    );
  }
  return triggerDownload(
    exportAgentSkillMarkdown(agent),
    `${agent.id}-skill.md`,
    'text/markdown;charset=utf-8',
  );
}

/**
 * Convenience 1-click download for all agent profiles as a bundle.
 */
export function downloadAllAgents(agents: AgentProfile[]): boolean {
  return triggerDownload(
    exportAllAgentsBundle(agents),
    'cosmolost-agents-bundle.json',
    'application/json;charset=utf-8',
  );
}
