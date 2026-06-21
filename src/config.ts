import * as vscode from 'vscode';

export interface Config {
  model: string;
  showRecentCommits: boolean;
  allowFileContext: boolean;
}

export function getConfig(): Config {
  const cfg = vscode.workspace.getConfiguration('claudeCommitGen');
  return {
    model: cfg.get<string>('model', 'haiku'),
    showRecentCommits: cfg.get<boolean>('showRecentCommits', true),
    allowFileContext: cfg.get<boolean>('allowFileContext', false),
  };
}
