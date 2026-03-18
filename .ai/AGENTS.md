# AGENTS.md

## Overview

This repository contains:

- `/docs` - Documentation corpus
- `/.ai/memory/` - Persistent memory (decisions, patterns, notes)
- `/.ai/skills/` - Agent skills

## Core Principles

- Always prefer retrieval over guessing
- Treat `/docs` as the source of truth
- Treat `/.ai/memory` as evolving knowledge
- Be concise, accurate, explicit about uncertainty

---

## Memory System

### Location

`.ai/memory/`

| File           | Purpose                             |
| -------------- | ----------------------------------- |
| `decisions.md` | Architectural and product decisions |
| `patterns.md`  | Coding standards and conventions    |
| `notes.md`     | Observations and insights           |

### Memory Rules

- Always read memory BEFORE answering
- Prefer memory if more recent than docs
- Never overwrite or delete existing entries
- Only append new entries

---

## Skills

All available skills are defined in `/.ai/skills/`.

---

## Citation Format

Always include sources:

Sources:

- docs/path/to/file.md
- .ai/memory/decisions.md
