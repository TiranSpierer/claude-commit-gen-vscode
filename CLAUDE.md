# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```sh
npm run compile          # Build with esbuild → dist/extension.js
npm run watch            # Build + watch for changes
npm run install:local    # Build, package VSIX, install in VS Code
npx tsc --noEmit        # Type-check without emitting
```

After any code change, run `npm run install:local` to rebuild and reinstall the extension, then tell the user to reload VS Code (Cmd+Shift+P → "Developer: Reload Window") to test.

## Architecture

VS Code extension that generates commit messages by spawning the Claude Code CLI (`claude`) as a child process with the staged diff piped to stdin.

**Flow:** `extension.ts` (orchestrator) → gets diff via VS Code Git API → builds prompt → spawns `claude` CLI → sets `repo.inputBox.value`.

**Source files (src/):**
- `extension.ts` — Command registration, generate flow, context key management for loading state
- `claude.ts` — Spawns `claude` CLI, handles timeout/cancellation/errors
- `git.ts` — Wraps VS Code Git extension API (diff, log, repo resolution)
- `prompts.ts` — System prompt and instruction builder
- `config.ts` — Reads `claudeCommitGen.*` settings

**Key design decisions:**
- Uses esbuild (not tsc) for bundling — single `dist/extension.js` output, no tsconfig emit
- No runtime dependencies — only `child_process` spawn and VS Code API
- `--max-turns 1` and `--allowedTools ''` (by default) keep CLI invocation fast and deterministic
- Menu placement uses `scm/title` (stable API) for marketplace compatibility
- Two commands swap via `when` context key (`claudeCommitGen.generating`) to show spinner during generation

## Settings Namespace

All settings are under `claudeCommitGen.*` — must match across `package.json` (contributes.configuration), `config.ts`, and `README.md`.

## Packaging

```sh
npm run vsix             # Marketplace-ready VSIX (scm/title, no proposed APIs)
```

The `.vscodeignore` excludes `src/`, `scripts/`, `tsconfig.json`, and dev files from the VSIX.

## Publishing to Marketplace

1. `npm run release -- patch` (or `minor`/`major`)
2. `npm run vsix` → produces `claude-commit-gen-<version>.vsix`
3. Go to https://marketplace.visualstudio.com/manage/publishers/tiranspierer
4. Click the "..." menu on the extension → **Update** → upload the `.vsix` file
5. Commit, tag, and push:
   ```sh
   git tag v<version>
   git push origin main --tags
   ```
