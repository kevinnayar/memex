---
name: read-memory
description: Read from the memory system to retrieve stored knowledge and context.
---

## Overview

The memory system stores knowledge that persists across sessions. Two layers: curated long-term (MEMORY.md) and daily logs.

## Memory Files

| File/Directory | Purpose |
|----------------|---------|
| `.agents/memory/MEMORY.md` | Curated long-term memory (decisions, preferences, durable facts) |
| `.agents/memory/daily/` | Daily logs organized by date |

## Session Start Behavior

At the start of each session, read:

1. Today's daily log (`.agents/memory/daily/YYYY-MM-DD.md`)
2. Yesterday's daily log (`.agents/memory/daily/YYYY-MM-DD.md`)
3. MEMORY.md (curated, important stuff)

## When to Read

- User asks "what do we remember about X?"
- Before answering any question (as a pre-step)
- User explicitly requests to read memory
- You need context from past sessions

## How to Read

### Daily Logs

```bash
# Today's log
TODAY=$(date +%Y-%m-%d)
cat .agents/memory/daily/$TODAY.md

# Yesterday's log
YESTERDAY=$(date -v-1d +%Y-%m-%d)
cat .agents/memory/daily/$YESTERDAY.md

# Search daily logs
grep -r "keyword" .agents/memory/daily/
```

### MEMORY.md

```bash
cat .agents/memory/MEMORY.md

# Search for specific info
grep -i "keyword" .agents/memory/MEMORY.md
```

### Search All Memory

```bash
grep -i "keyword" .agents/memory/MEMORY.md
grep -ri "keyword" .agents/memory/daily/
```

## Graceful Degradation

If today's daily log doesn't exist, that's fine - just skip it. Don't error.

```bash
TODAY=$(date +%Y-%m-%d)
if [ -f .agents/memory/daily/$TODAY.md ]; then
  cat .agents/memory/daily/$TODAY.md
fi
```

## Priority

When memory conflicts with docs:
1. **MEMORY.md** > daily logs > docs
2. More recent daily entries > older entries
3. Explicit decisions > inferred context

## Output Format

After reading, summarize relevant points:

```
Memory:
- MEMORY.md: [relevant decisions/preferences]
- daily/YYYY-MM-DD: [relevant notes]
```

If nothing relevant found:
```
No relevant memory found.
```
