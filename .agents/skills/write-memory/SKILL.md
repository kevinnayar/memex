---
name: write-memory
description: Write new knowledge to the memory system for persistent storage.
---

## Overview

The memory system stores knowledge that persists across sessions. Two layers: MEMORY.md for durable facts, daily logs for context.

## Memory Files

| File | When to Use |
|------|-------------|
| `.agents/memory/MEMORY.md` | Decisions, preferences, durable facts (things that should stick) |
| `.agents/memory/daily/YYYY-MM-DD.md` | Day-to-day notes, session context |

## When to Write

Write to memory when:

- ✅ User says "remember this"
- ✅ Information will be useful in future sessions
- ✅ A decision or preference is established
- ✅ Context from today might matter tomorrow

Do NOT write:

- ❌ Trivial Q&A
- ❌ Redundant documentation
- ❌ One-off answers
- ❌ Guesses or assumptions

## Decision Tree

```
Is it a durable fact (decision, preference, pattern)?
  → Yes: Write to MEMORY.md
  → No: Is it context worth remembering tomorrow?
    → Yes: Write to today's daily log
    → No: Don't write
```

## How to Write

### Daily Log (Today)

```bash
TODAY=$(date +%Y-%m-%d)
mkdir -p .agents/memory/daily

cat >> .agents/memory/daily/$TODAY.md << 'EOF'

## Notes

<content>
EOF
```

### MEMORY.md (Durable Facts)

```bash
cat >> .agents/memory/MEMORY.md << 'EOF'

## Decisions

### YYYY-MM-DD - Title

<content>

## Preferences

### YYYY-MM-DD - Title

<content>
EOF
```

## Rules

1. **Always APPEND** - never overwrite or delete existing entries
2. **Use today's date** when adding to daily logs
3. **Organize MEMORY.md** into sections (Decisions, Preferences, etc.)
4. **Be concise** - memory is for facts, not essays

## Examples

**User says "remember we use JWT tokens":**
```bash
cat >> .agents/memory/MEMORY.md << 'EOF'

## Decisions

### 2026-03-21 - Auth Token Strategy

We use JWT tokens with 24-hour expiry.
EOF
```

**Session ends, worth remembering tomorrow:**
```bash
TODAY=$(date +%Y-%m-%d)
cat >> .agents/memory/daily/$TODAY.md << 'EOF'

## Context

- Discussed caching strategy with team
- Need to revisit after performance testing
EOF
```

## Post-Write

After writing, confirm:
```
✓ Saved to .agents/memory/MEMORY.md
✓ Saved to .agents/memory/daily/YYYY-MM-DD.md
```
