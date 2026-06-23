# Claude Commit Gen

VS Code extension that generates commit messages from your diff using the Claude Code CLI.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- Git

## Install

Search **"Claude Commit Gen"** in the VS Code Extensions panel, or:

```sh
code --install-extension tiranspierer.claude-commit-gen
```

## Usage

1. Stage your changes (`git add`) — or skip staging to use all working tree changes
2. Click the Claude icon in the Source Control title bar (or `Cmd+Shift+Alt+C`)
3. Review the generated message, edit if needed, commit

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `claudeCommitGen.showRecentCommits` | `true` | Include last 5 commit messages so Claude matches your style. |
| `claudeCommitGen.allowFileContext` | `false` | Let Claude read surrounding files for context. When disabled, only the diff is visible. |
| `claudeCommitGen.model` | `"haiku"` | Alias (`haiku`, `sonnet`, `opus`) or full model ID (`claude-haiku-4-5`). |

## Privacy

- **Zero network calls** from the extension itself.
- No telemetry, no analytics, no data collection.
- The only process spawned is `claude` (your local CLI), which communicates with whatever backend you have configured (Anthropic API, Subscription, etc.).

## Disclaimer

This project is **not affiliated with, endorsed by, or sponsored by Anthropic**. "Claude" is a trademark of Anthropic, PBC. This extension is an independent tool that interfaces with the Claude Code CLI.

## License

MIT
