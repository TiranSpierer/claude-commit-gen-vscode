# Claude Commit Gen

VS Code extension that generates commit messages from your diff using the Claude Code CLI.

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

1. Stage your changes (`git add`) — or skip staging to use all working tree changes
2. Click the Claude icon in the Source Control title bar (or `Cmd+Shift+Alt+C`)
3. Review the generated message, edit if needed, commit

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `claudeCommitGen.model` | `string` | `"haiku"` | Passed directly to `claude --model`. Accepts aliases (`haiku`, `sonnet`, `opus`) or full model IDs (`claude-haiku-4-5-20251001`). |
| `claudeCommitGen.showRecentCommits` | `boolean` | `true` | Include last 5 commit messages in the prompt so Claude matches your existing style. |
| `claudeCommitGen.allowFileContext` | `boolean` | `false` | Let Claude read surrounding files for context. When `false`, only the diff is visible (faster). |

## Privacy

- This extension makes **zero network calls** of its own.
- No telemetry, no analytics, no data collection.
- The only process spawned is `claude` (your local CLI), which communicates with whatever backend you have configured (Anthropic API, Subscription, etc.).

## Disclaimer

This project is **not affiliated with, endorsed by, or sponsored by Anthropic**. "Claude" is a trademark of Anthropic, PBC. This extension is an independent tool that interfaces with the Claude Code CLI.

## License

MIT
