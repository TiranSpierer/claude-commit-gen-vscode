import * as vscode from 'vscode';

interface GitExtension {
  getAPI(version: 1): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
  getRepository(uri: vscode.Uri): Repository | null;
}

export interface Repository {
  rootUri: vscode.Uri;
  inputBox: { value: string };
  diff(cached: boolean): Promise<string>;
  log(options: { maxEntries: number }): Promise<{ hash: string; message: string }[]>;
  status(): Promise<void>;
}

export async function getRepository(targetUri?: vscode.Uri): Promise<Repository | null> {
  const ext = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!ext) {
    vscode.window.showErrorMessage('Git extension not found.');
    return null;
  }

  if (!ext.isActive) {
    await ext.activate();
  }

  const api = ext.exports.getAPI(1);

  if (api.repositories.length === 0) {
    vscode.window.showErrorMessage('No git repository found in workspace.');
    return null;
  }

  if (targetUri) {
    const match = api.getRepository(targetUri) ??
      api.repositories.find(r => r.rootUri.fsPath === targetUri.fsPath);
    if (match) return match;
  }

  if (api.repositories.length === 1) {
    return api.repositories[0];
  }

  const activeUri = vscode.window.activeTextEditor?.document.uri;
  if (activeUri) {
    const match = api.getRepository(activeUri);
    if (match) return match;
  }

  return api.repositories[0];
}

export async function getDiff(repo: Repository): Promise<string> {
  try {
    await repo.status();
  } catch {
    // non-fatal
  }
  const staged = await repo.diff(true);
  if (staged.trim()) return staged;
  return repo.diff(false);
}

export async function getRecentLog(repo: Repository): Promise<string> {
  try {
    const commits = await repo.log({ maxEntries: 5 });
    return commits
      .map(c => `${c.hash.slice(0, 7)} ${c.message.split('\n')[0]}`)
      .join('\n');
  } catch {
    return '';
  }
}
