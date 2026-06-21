import * as vscode from 'vscode';
import { getRepository, getStagedDiff, getRecentLog } from './git';
import { runClaude, stripCodeFences } from './claude';
import { getConfig } from './config';
import { SYSTEM_PROMPT, buildInstruction, buildContext } from './prompts';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'claudeCommit.generate',
    (arg?: unknown) => generateCommitMessage(extractRootUri(arg))
  );
  context.subscriptions.push(disposable);
}

export function deactivate(): void {}

async function generateCommitMessage(targetUri?: vscode.Uri): Promise<void> {
  const repo = await getRepository(targetUri);
  if (!repo) return;

  const config = getConfig();
  const diff = await getStagedDiff(repo);

  if (!diff.trim()) {
    vscode.window.showWarningMessage('No staged changes. Stage some changes first.');
    return;
  }

  const log = config.showRecentCommits ? await getRecentLog(repo) : '';
  const instruction = buildInstruction(config.allowFileContext);
  const context = buildContext(diff, log);

  const message = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Generating commit message…', cancellable: true },
    (_progress, token) => runClaude(instruction, context, {
      model: config.model,
      allowFileContext: config.allowFileContext,
      cwd: repo.rootUri.fsPath,
      systemPrompt: SYSTEM_PROMPT,
    }, token)
  );

  if (!message) return;

  const trimmed = stripCodeFences(message.trim());
  if (!trimmed) {
    vscode.window.showWarningMessage('Claude returned an empty response.');
    return;
  }

  repo.inputBox.value = trimmed;
}

function extractRootUri(arg: unknown): vscode.Uri | undefined {
  if (!arg || typeof arg !== 'object') return undefined;
  const rootUri = (arg as { rootUri?: unknown }).rootUri;
  if (rootUri && typeof rootUri === 'object' && 'fsPath' in rootUri) {
    return rootUri as vscode.Uri;
  }
  return undefined;
}
