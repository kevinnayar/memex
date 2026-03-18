---
name: read-memory
description: Read from the memory system to retrieve stored knowledge, decisions, patterns, and notes.
---

## Overview

The memory system stores evolving knowledge that may not yet be in docs. Memory is more reliable than docs for recent decisions and personal context.

## Memory Files

| File | Purpose | Priority |
|------|---------|----------|
| `.ai/memory/decisions.md` | Architectural, product, and important decisions | HIGHEST |
| `.ai/memory/patterns.md` | Coding standards, conventions, recurring solutions | HIGH |
| `.ai/memory/notes.md` | Observations, debugging insights, quirks, personal context | MEDIUM |

## When to Use

- User asks "what do we remember about X?"
- Before answering any question (as a pre-step)
- User explicitly requests to read memory
- You need context about past decisions or patterns

## How to Read Memory

### 1. Quick Scan (for questions)

```bash
# Search all memory files for a keyword
grep -i "keyword" .ai/memory/*.md

# Or read specific file
cat .ai/memory/decisions.md
```

### 2. Full Read (for important decisions)

```bash
# Read each file completely
cat .ai/memory/decisions.md
cat .ai/memory/patterns.md
cat .ai/memory/notes.md
```

### 3. Recent Entries First

Memory is append-only with newest entries at the top. Always check recent entries first - they take precedence.

## Priority Rules

When memory conflicts with docs:
1. **decisions.md** > **patterns.md** > **notes.md** > docs
2. More recent memory > older memory
3. Explicit decisions > inferred patterns

## Output Format

After reading, summarize:

```
Memory Summary:
- decisions.md: [key points relevant to query]
- patterns.md: [relevant patterns]
- notes.md: [relevant notes]
```

If nothing relevant found:
```
No relevant memory found.
```

## Examples

**Query: "auth tokens"**
```bash
grep -i "auth" .ai/memory/*.md
```

**Query: "What's the caching approach?"**
```bash
grep -i "cache" .ai/memory/patterns.md
```

**Query: "What decisions have we made about the API?"**
```bash
cat .ai/memory/decisions.md
```
