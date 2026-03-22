---
name: memsearch
description: Search and answer questions from your persistent memory.
---

## Overview

Search your memory for answers. Uses semantic search via qmd with fallback to grep. Supports time-filtered searches for daily logs.

## When to Use

- User asks about past decisions or context
- Query mentions a timeframe ("last week", "March")
- Need to recall something from memory

## Memory Structure

```
.agents/memory/
├── MEMORY.md          # Curated long-term (decisions, preferences)
└── daily/            # Daily logs
    └── YYYY-MM-DD.md  # Session notes
```

## How to Search

### Semantic Search (qmd)

```bash
qmd query "your search terms" -c memex-memory
```

### Time-Filtered Search

For queries with timeframes, use find + grep:

**"Last 3 days":**
```bash
find .agents/memory/daily/ -name "*.md" -mtime -3 -exec grep -l "keyword" {} \;
```

**"Last week":**
```bash
find .agents/memory/daily/ -name "*.md" -mtime -7 -exec grep -l "keyword" {} \;
```

**"This month":**
```bash
find .agents/memory/daily/ -name "????-03-*.md" -exec grep -l "keyword" {} \;
```

**Specific month ("March 2026"):**
```bash
find .agents/memory/daily/ -name "2026-03-*.md" -exec grep -i "keyword" {} \;
```

### Simple Queries (grep fallback)

```bash
grep -ri "keyword" .agents/memory/
```

### When to Use Which

| Query Type | Method |
|------------|--------|
| Natural language, no timeframe | qmd query |
| Timeframe ("last 3 days") | find + grep |
| Single keyword | grep |
| Specific date/month | find + grep |

## Citation Format

Always cite sources:

Sources:
- .agents/memory/MEMORY.md
- .agents/memory/daily/YYYY-MM-DD.md

## Example

**Question:** "What did I say about caching last week?"

```bash
find .agents/memory/daily/ -name "*.md" -mtime -7 -exec grep -i "cache" {} \;
```

**Question:** "What are my key decisions?"

```bash
qmd query "decisions architecture" -c memex-memory
```

**Answer:** [synthesized response]

Sources:
- .agents/memory/MEMORY.md
- .agents/memory/daily/2026-03-21.md
