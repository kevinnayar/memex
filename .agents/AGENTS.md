# AGENTS.md

## Overview

This repository contains:

- `/docs` - Documentation corpus (private, gitignored)
- `/.agents/memory/` - Persistent memory across sessions
- `/.agents/skills/` - Agent skills

## Core Principles

- Always prefer retrieval over guessing
- Treat `/docs` as the source of truth
- Memory is for facts that should persist across sessions
- Be concise, accurate, explicit about uncertainty

---

## Skills

| Skill | Purpose |
|-------|---------|
| `docsearch` | Search and answer from docs |
| `memsearch` | Search and answer from memory |

---

## Memory System

### Structure

```
.agents/memory/
├── MEMORY.md          # Curated long-term (decisions, preferences)
└── daily/             # Daily logs
    └── YYYY-MM-DD.md  # Session notes
```

### Session Start

Read at session start:

1. Today's daily log (if exists)
2. Yesterday's daily log (if exists)
3. MEMORY.md

---

## Writing to Memory

### When to Write

Write to memory when:

- User says "remember this"
- A decision or preference is established
- Information will be useful in future sessions

### Where to Write

**MEMORY.md** - Durable facts (decisions, preferences, patterns)

**daily/YYYY-MM-DD.md** - Session context (notes, observations)

### How to Write

Always APPEND - never overwrite or delete entries.

```bash
# Append to MEMORY.md
cat >> .agents/memory/MEMORY.md << 'EOF'

## Decisions

### YYYY-MM-DD - Title

Content here
EOF
```

```bash
# Append to today's daily log
TODAY=$(date +%Y-%m-%d)
mkdir -p .agents/memory/daily
cat >> .agents/memory/daily/$TODAY.md << 'EOF'

## Notes

Content here
EOF
```

### Rules

1. Always APPEND - never overwrite or delete entries
2. Use today's date for daily logs
3. Organize MEMORY.md into sections (Decisions, Preferences, etc.)
4. Be concise - memory is for facts, not essays

---

## Citation Format

Always include sources:

Sources:

- docs/path/to/file.md
- .agents/memory/MEMORY.md
- .agents/memory/daily/YYYY-MM-DD.md
