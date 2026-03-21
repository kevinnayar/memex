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

1. Today's daily log
2. Yesterday's daily log
3. MEMORY.md

### Rules

- Read memory BEFORE answering questions
- Write to MEMORY.md for durable facts (decisions, preferences)
- Write to daily/YYYY-MM-DD.md for session context
- Always APPEND - never overwrite or delete entries

---

## Skills

All available skills are defined in `/.agents/skills/`.

---

## Citation Format

Always include sources:

Sources:

- docs/path/to/file.md
- .agents/memory/MEMORY.md
