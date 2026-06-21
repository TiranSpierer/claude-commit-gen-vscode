export const SYSTEM_PROMPT = [
  'You are a commit message generator.',
  'Output ONLY the commit message text — nothing else.',
  '',
  'Rules:',
  '- Use Conventional Commits format: type(scope): description',
  '- Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert',
  '- Scope is optional but encouraged when the change targets a specific module or component.',
  '- Subject line: imperative mood, <=72 characters, no trailing period.',
  '- Body (only if the change warrants explanation): blank line after subject, wrap at 72 columns, explain why not what.',
  '- Match the commit style shown in RECENT COMMITS if provided.',
  '- Never ask questions. Never add commentary, markdown, or code fences.',
  '- Do not invent changes absent from the diff.',
].join('\n');

export function buildInstruction(allowFileContext: boolean): string {
  const parts = [
    'Generate a commit message for the staged changes provided via stdin.',
    'Output ONLY the commit message — no explanation, no markdown, no fences.',
  ];

  if (allowFileContext) {
    parts.push('You may read relevant files for context if a symbol is unclear from the diff alone.');
  }

  return parts.join('\n');
}

export function buildContext(diff: string, log: string): string {
  const parts = [
    '=== STAGED DIFF (begin) ===',
    diff,
    '=== STAGED DIFF (end) ===',
  ];

  if (log.trim()) {
    parts.push('', '=== RECENT COMMITS (begin) ===', log, '=== RECENT COMMITS (end) ===');
  }

  return parts.join('\n');
}
