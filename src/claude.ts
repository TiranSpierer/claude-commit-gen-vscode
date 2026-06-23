import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';

const TIMEOUT_MS = 30_000;

export function runClaude(
  instruction: string,
  context: string,
  options: { model: string; allowFileContext: boolean; cwd: string; systemPrompt: string },
  token: vscode.CancellationToken
): Promise<string | undefined> {
  return new Promise<string | undefined>((resolve) => {
    if (token.isCancellationRequested) {
      resolve(undefined);
      return;
    }

    const args = [
      '-p', instruction,
      '--model', options.model,
      '--effort', 'low',
      '--no-session-persistence',
      '--max-turns', '1',
      '--bare',
      '--system-prompt', options.systemPrompt,
    ];

    if (!options.allowFileContext) {
      args.push('--allowedTools', '');
    }

    const child: ChildProcess = spawn('claude', args, {
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let settled = false;

    const settle = (value: string | undefined) => {
      if (settled) return;
      settled = true;
      cancelListener.dispose();
      clearTimeout(timer);
      resolve(value);
    };

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      vscode.window.showErrorMessage(`Claude CLI timed out after ${TIMEOUT_MS / 1000}s.`);
      settle(undefined);
    }, TIMEOUT_MS);

    const cancelListener = token.onCancellationRequested(() => {
      child.kill('SIGTERM');
      settle(undefined);
    });

    child.stdout?.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr?.on('data', (chunk: Buffer) => stderrChunks.push(chunk));
    child.stdin?.on('error', () => {});

    child.on('close', (code) => {
      if (token.isCancellationRequested) {
        settle(undefined);
        return;
      }

      const stdout = Buffer.concat(stdoutChunks).toString();
      const stderr = Buffer.concat(stderrChunks).toString();

      if (code !== 0) {
        const msg = stderr.trim() || stdout.trim() || `Process exited with code ${code}`;
        vscode.window.showErrorMessage(`Claude CLI failed: ${msg.slice(0, 500)}`);
        settle(undefined);
        return;
      }

      settle(stdout);
    });

    child.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        vscode.window.showErrorMessage('"claude" not found in PATH. Install Claude Code CLI.');
      } else {
        vscode.window.showErrorMessage(`Failed to start Claude CLI: ${err.message}`);
      }
      settle(undefined);
    });

    child.stdin?.end(context);
  });
}
