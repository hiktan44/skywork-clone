export const TASK_MODULES = ['SLIDES', 'DOCUMENT', 'IMAGE', 'SHEET', 'WEBSITE', 'VIDEO'] as const;
export type TaskModule = (typeof TASK_MODULES)[number];

export const TASK_COLUMNS = `id, name, cron, module, prompt, active, "lastRun", "nextRun", "createdAt"`;

// Five space-separated cron fields; each field limited to the usual cron characters.
const CRON_FIELD = /^[\d*/,\-]+$/;

export function isValidCron(cron: string): boolean {
  const fields = cron.trim().split(/\s+/);
  return fields.length === 5 && fields.every((f) => CRON_FIELD.test(f));
}

export interface TaskInput {
  name: string;
  cron: string;
  module: TaskModule;
  prompt: string;
}

/** Validates a create payload; returns an error code or the cleaned input. */
export function parseTaskInput(body: unknown): { error: string } | { value: TaskInput } {
  if (!body || typeof body !== 'object') return { error: 'invalid_request' };
  const { name, cron, module, prompt } = body as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim() || name.length > 120) return { error: 'invalid_name' };
  if (typeof cron !== 'string' || !isValidCron(cron)) return { error: 'invalid_cron' };
  if (typeof module !== 'string' || !TASK_MODULES.includes(module as TaskModule)) return { error: 'invalid_module' };
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 2000) return { error: 'invalid_prompt' };
  return {
    value: { name: name.trim(), cron: cron.trim().replace(/\s+/g, ' '), module: module as TaskModule, prompt: prompt.trim() },
  };
}
