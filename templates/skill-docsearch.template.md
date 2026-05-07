---
name: docsearch
description: Search docs, memory, and daily notes. Use for any question about past tasks, goals, notes, decisions, habits, or anything recorded in the corpus.
---

## Overview

Search all of `{{docsPath}}/` using hybrid semantic + BM25 search with re-ranking via qmd, with grep fallback for exact/simple matches. Covers everything: memory, daily notes, articles, plans, and all other docs.

## When to Use

- Any question about something that might be in docs
- Queries with timeframes ("last week", "this month", "yesterday")
- Recalling decisions, preferences, tasks, or logs
- Before answering any factual question about the user's life, work, or notes

## How to Search

### Primary: Hybrid Search (qmd)

```bash
qmd query "your search terms" -c memex-docs
```

Use for natural language questions, multi-keyword queries, and anything semantic.

### Fallback: Exact Match (grep)

```bash
grep -ri "keyword" {{docsPath}}/
```

Use for single keywords or exact phrases when qmd isn't needed.

### Time-Filtered Daily Notes

For queries with a timeframe, use `find` on `{{docsPath}}/daily/` then grep:

**Last N days:**
```bash
find {{docsPath}}/daily/ -name "*.md" -mtime -N | xargs grep -il "keyword"
```

**Last week:**
```bash
find {{docsPath}}/daily/ -name "*.md" -mtime -7 | xargs grep -il "keyword"
```

**Specific month:**
```bash
find {{docsPath}}/daily/ -name "2026-04-*.md" | xargs grep -il "keyword"
```

**Read a specific daily note:**
```bash
cat {{docsPath}}/daily/YYYY-MM-DD.md
```

To find unfinished tasks, look for `- [ ]` markers:
```bash
find {{docsPath}}/daily/ -name "*.md" -mtime -7 | xargs grep -l "\- \[ \]"
```

### Memory Search

```bash
# Semantic
qmd query "search terms" -c memex-docs

# Direct read
cat {{docsPath}}/agents/MEMORY.md
```

### Get Full Document

```bash
cat {{docsPath}}/path/to/file.md
```

## Evaluate Results

| Score | Action |
|-------|--------|
| > 70% | Use confidently |
| 40–70% | Verify with context |
| < 40% | Try different terms, don't fabricate |

If no good results: rephrase, try grep, or tell the user nothing was found.

## Writing to Daily Notes

When the user asks to create a note, log something, or record a task:

```bash
TODAY=$(date +%Y-%m-%d)
cat >> {{docsPath}}/daily/$TODAY.md << 'EOF'

## Notes

- Your note here
EOF
```

## Examples

**"What tasks didn't I finish last week?"**
```bash
find {{docsPath}}/daily/ -name "*.md" -mtime -7 | xargs grep -l "\- \[ \]" | xargs grep "\- \[ \]"
```

**"How much did I run this week?"**
```bash
find {{docsPath}}/daily/ -name "*.md" -mtime -7 | xargs grep -il "run\|running\|miles\|km"
```

**"Create a note that I need to call the county tomorrow"**
```bash
TODAY=$(date +%Y-%m-%d)
cat >> {{docsPath}}/daily/$TODAY.md << 'EOF'

## Tasks

- [ ] Call the county (tomorrow)
EOF
```

**"What are my key decisions?"**
```bash
qmd query "key decisions" -c memex-docs
# or
grep -A3 "## Decisions" {{docsPath}}/agents/MEMORY.md
```

## Citation Format

Always cite sources:

Sources:
- {{docsPath}}/agents/MEMORY.md
- {{docsPath}}/daily/YYYY-MM-DD.md
- {{docsPath}}/path/to/file.md
