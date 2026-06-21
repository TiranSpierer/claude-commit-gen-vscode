export const SYSTEM_PROMPT = [
  'You are a commit message generator.',
  'Output ONLY the commit message text — nothing else.',
  '',
  'Rules:',
  '- Use Conventional Commits format.',
  '- Subject line: imperative mood, <=72 characters, no trailing period.',
  '- Body only if the change warrants explanation.',
  '- Match the style shown in RECENT COMMITS if provided.',
  '- No commentary, no markdown fences, no questions.',
].join('\n');

export function buildInstruction(allowFileContext: boolean): string {
  const parts = [
    'Generate a commit message for the changes provided via stdin.',
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
