---
name: answer-question
description: Answer a question by searching docs and memory, then provide a cited response.
---

## Overview

This skill answers questions by:
1. Reading from memory (MEMORY.md, daily logs)
2. Searching the documentation
3. Synthesizing an answer with citations

## When to Use

Use this skill when a user asks a question that should be answered based on existing knowledge in this repository.

---

## Step 1: Read Memory

Use the **read-memory** skill first to check if relevant information exists.

```bash
# Search MEMORY.md
grep -i "keyword" .agents/memory/MEMORY.md

# Search daily logs
grep -ri "keyword" .agents/memory/daily/
```

Priority: MEMORY.md > daily logs

---

## Step 2: Search Documentation

Use the **search-docs** skill to find relevant docs.

```bash
qmd query "your search terms" -c memex
```

---

## Step 3: Evaluate Results

| Score | Action |
|-------|--------|
| > 70% | Use confidently |
| 40-70% | Verify with context |
| < 40% | Be skeptical |

If no good results: try different keywords, don't fabricate.

---

## Step 4: Synthesize Answer

1. Direct answer first
2. Supporting details in bullets
3. Cite sources

## Step 5: Citation Format

Sources:
- docs/path/to/file.md
- .agents/memory/MEMORY.md
- .agents/memory/daily/YYYY-MM-DD.md

---

## Step 6: Consider Writing Memory (Optional)

If this knowledge should be persisted, use the **write-memory** skill.

---

## Example

**Question:** "What's our auth strategy?"

1. Read memory: `grep -i "auth" .agents/memory/MEMORY.md`
2. Search docs: `qmd query "auth tokens" -c memex`
3. Answer: "We use JWT v2 tokens with 24-hour expiry"

Sources:
- .agents/memory/MEMORY.md
- docs/auth/tokens.md
