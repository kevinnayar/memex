# Memex

```
    ███╗   ███╗███████╗███╗   ███╗███████╗██╗  ██╗
    ████╗ ████║██╔════╝████╗ ████║██╔════╝╚██╗██╔╝
    ██╔████╔██║█████╗  ██╔████╔██║█████╗   ╚███╔╝
    ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══╝   ██╔██╗
    ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║███████╗██╔╝ ██╗
    ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
        The machine remembers what you forget
```

> A memex (a portmanteau of "memory" and "index") is a hypothetical electromechanical device for interacting with microform documents and described in Vannevar Bush's 1945 article "As We May Think". Bush envisioned the memex as a device in which individuals would compress and store all of their books, records, and communications, "mechanized so that it may be consulted with exceeding speed and flexibility". The individual was supposed to use the memex as an automatic personal filing system, making the memex "an enlarged intimate supplement to his memory".

— [Wikipedia](https://en.wikipedia.org/wiki/Memex)

## Overview

Personal knowledge management with AI agents. The machine remembers what you forget.

## Setup

```bash
./setup.sh
```

Setup will prompt for your name and a description of your notes.

## What's Included

| Component         | Description                                    |
| ----------------- | ---------------------------------------------- |
| `docs/`           | Your knowledge corpus (gitignored, private)    |
| `docs/plans/`     | Plans and design documents (tracked)           |
| `.agents/memory/` | Persistent memory across sessions (gitignored) |
| `.agents/skills/` | Agent skills for search, memory, Q&A           |

## Memory System

Two layers of memory:

- **MEMORY.md** - Curated long-term (decisions, preferences, durable facts)
- **daily/YYYY-MM-DD.md** - Session logs (context, notes)

### Tips

- Say **"remember this"** explicitly - don't assume the model will remember
- Ask **"write this to memory"** if you want something to stick
- **Durable facts** → MEMORY.md (preferences, decisions, patterns)
- **Daily context** → daily/YYYY-MM-DD.md (session notes)

## Syncing to Dropbox

Since your docs folder (defined by `docsPath` in config.json) is gitignored, you can sync it separately with Dropbox.

If your docs are already in Dropbox:

```bash
ln -s ~/Dropbox/docs ~/src/memex/docs
```

If starting fresh:

```bash
# Move docs to Dropbox
mv docs ~/Dropbox/docs

# Symlink back
ln -s ~/Dropbox/docs docs
```

Replace `docs` with your actual docs folder name if different.

## Dependencies

- [qmd](https://github.com/gptscript-ai/qmd) - Semantic search over docs
- [Bun](https://bun.sh) - JavaScript runtime (installed by setup)
