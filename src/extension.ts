import * as vscode from 'vscode';
import { getRepository, getDiff, getRecentLog } from './git';
import { runClaude } from './claude';
import { getConfig } from './config';
import { SYSTEM_PROMPT, buildInstruction, buildContext } from './prompts';

let activeCts: vscode.CancellationTokenSource | undefined;

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'claudeCommitGen.generate',
      (arg?: unknown) => generateCommitMessage(extractRootUri(arg))
    ),
    vscode.commands.registerCommand('claudeCommitGen.generateCancel', () => {
      activeCts?.cancel();
    }),
  );
}

export function deactivate(): void {}

async function generateCommitMessage(targetUri?: vscode.Uri): Promise<void> {
  if (activeCts) return;

  const repo = await getRepository(targetUri);
  if (!repo) return;

  const config = getConfig();
  const diff = await getDiff(repo);

  if (!diff.trim()) {
    vscode.window.showWarningMessage('No changes detected.');
    return;
  }

  const cts = new vscode.CancellationTokenSource();
  activeCts = cts;
  await vscode.commands.executeCommand('setContext', 'claudeCommitGen.generating', true);

  try {
    const log = config.showRecentCommits ? await getRecentLog(repo) : '';
    const instruction = buildInstruction(config.allowFileContext);
    const ctx = buildContext(diff, log);

    const message = await runClaude(instruction, ctx, {
      model: config.model,
      allowFileContext: config.allowFileContext,
      cwd: repo.rootUri.fsPath,
      systemPrompt: SYSTEM_PROMPT,
    }, cts.token);

    if (!message || cts.token.isCancellationRequested) return;

    const trimmed = message.trim();
    if (!trimmed) {
      vscode.window.showWarningMessage('Claude returned an empty response.');
      return;
    }

    repo.inputBox.value = trimmed;
  } finally {
    cts.dispose();
    activeCts = undefined;
    await vscode.commands.executeCommand('setContext', 'claudeCommitGen.generating', false);
  }
}

function extractRootUri(arg: unknown): vscode.Uri | undefined {
  if (!arg || typeof arg !== 'object') return undefined;
  const rootUri = (arg as { rootUri?: unknown }).rootUri;
  if (rootUri && typeof rootUri === 'object' && 'fsPath' in rootUri) {
    return rootUri as vscode.Uri;
  }
  return undefined;
}
