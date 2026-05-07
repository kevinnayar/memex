# Memex

```
 ███╗   ███╗███████╗███╗   ███╗███████╗██╗  ██╗
 ████╗ ████║██╔════╝████╗ ████║██╔════╝╚██╗██╔╝
 ██╔████╔██║█████╗  ██╔████╔██║█████╗   ╚███╔╝
 ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══╝   ██╔██╗
 ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║███████╗██╔╝ ██╗
 ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
```

> The machine remembers what you forget.

Personal knowledge management with AI agents. Write notes in Markdown, search and query them with Claude Code or OpenCode.

## Requirements

At least one AI agent — the only things you need to install manually:

- [Claude Code](https://claude.ai/code)
- [OpenCode](https://opencode.ai/)

The following are also required and will be installed automatically by `setup.sh` if missing:

- [Node.js](https://nodejs.org) (via nvm)
- [Bun](https://bun.sh)
- [qmd](https://github.com/uses-ink/qmd)

## How it works

Memex is a folder of Markdown files paired with an AI agent that can search, retrieve, and reason over them. It works with any folder of Markdown — Obsidian, iA Writer, plain files, whatever you write in. No lock-in.

Your notes are gitignored and stay private — on your machine or synced via Obsidian Sync, iCloud, Dropbox, etc. They are never committed to this repo.

## Directory Structure

```
memex/               ← this repo
└── docs/            ← your notes (or whatever you set as docsPath)
    ├── daily/
    └── ...
```

If you use Obsidian, point `docsPath` at your vault. The `.obsidian/` folder will be ignored by qmd — only your Markdown files are indexed.

## Setup

**Step 1** — Install [Claude Code](https://claude.ai/code) or [OpenCode](https://opencode.ai/) (or both).

**Step 2** — Configure `config.json` in the repo root:

```json
{
  "user": "Your Name",
  "description": "Brief description of your notes (used for search context)",
  "docsPath": "docs"
}
```

**Step 3** — Run setup:

```bash
./setup.sh
```

The script installs Bun and qmd if they're not already present, then wires everything up. Re-run any time to refresh symlinks or re-index.

### What setup does

1. **Dependencies** — installs Node.js (via nvm), Bun, and qmd if missing.
2. **Agent files** — creates the following inside `{docsPath}/agents/` if they don't exist:
   - `AGENTS.md` — your agent's system definition: how it should behave, what your notes are about, any rules or preferences
   - `MEMORY.md` — persistent memory written and read across sessions
   - `skills/` — folder for custom agent skills
3. **Agent symlinks** — creates `.claude/` and `.opencode/` config directories and symlinks the agent files and settings so Claude Code and OpenCode pick them up automatically.
4. **qmd config** — writes `~/.config/qmd/index.yml` pointing at your notes and agent memory.
5. **Index** — runs `qmd update && qmd embed` to build the semantic search index.

If `AGENTS.md` is new and empty, the script will prompt you with a message to open your agent and set it up.
