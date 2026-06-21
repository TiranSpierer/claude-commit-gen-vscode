# Claude Commit Gen

VS Code extension that generates commit messages from your staged diff using the Claude Code CLI.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- Git

## Install

```sh
# From source
git clone https://github.com/tiranspierer/claude-commit-gen-vscode
cd claude-commit-gen-vscode
npm install
npx @vscode/vsce package
code --install-extension claude-commit-gen-*.vsix
```

## Usage

1. Stage your changes (`git add`)
2. Click the generate icon in the commit message input box (or `Cmd+Shift+Alt+C`)
3. Review the generated message, edit if needed, commit

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `claudeCommit.model` | `string` | `"haiku"` | Passed directly to `claude --model`. Accepts aliases (`haiku`, `sonnet`, `opus`) or full model IDs (`claude-haiku-4-5-20251001`). |
| `claudeCommit.showRecentCommits` | `boolean` | `true` | Include last 5 commit messages in the prompt so Claude matches your existing style. |
| `claudeCommit.allowFileContext` | `boolean` | `true` | Let Claude read surrounding files for context. When `false`, passes `--tools ""` so only the staged diff is visible. |

## Privacy

- This extension makes **zero network calls** of its own.
- No telemetry, no analytics, no data collection.
- The only process spawned is `claude` (your local CLI), which communicates with whatever backend you have configured (Anthropic API, proxy, Bedrock, etc.).
- Your diff is sent wherever your `claude` CLI is pointed — this extension has no knowledge of or control over that.

## Disclaimer

This project is **not affiliated with, endorsed by, or sponsored by Anthropic**. "Claude" is a trademark of Anthropic, PBC. This extension is an independent tool that interfaces with the Claude Code CLI.

## License

MIT
