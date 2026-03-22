---
name: docsearch
description: Search and answer questions from your documentation corpus.
---

## Overview

Search your docs for answers. Uses semantic search via qmd with fallback to grep for simple queries.

## When to Use

- User asks a question about something that might be in docs
- You need to find information from your notes
- Before answering factual questions

## How to Search

### Semantic Search (qmd)

```bash
qmd query "your search terms" -c memex-docs
```

### Simple Queries (grep fallback)

For single keywords or simple phrases:

```bash
grep -ri "keyword" docs/
```

### When to Use Which

| Query Type | Method |
|------------|--------|
| Natural language questions | qmd query |
| Single keyword | grep (faster) |
| Exact phrase match | grep -i |
| Multiple keywords | qmd query |

## Evaluate Results

| Score | Action |
|-------|--------|
| > 70% | Use confidently |
| 40-70% | Verify with context |
| < 40% | Be skeptical |

If no good results: try different keywords, don't fabricate.

## Get Full Document

If you need more context from a result:

```bash
qmd get docs/path/to/file.md --line-numbers
```

## Citation Format

Always cite sources:

Sources:
- docs/path/to/file.md

## Example

**Question:** "What's our approach to caching?"

```bash
qmd query "caching strategy" -c memex-docs
```

**Answer:** [synthesized response]

Sources:
- docs/engineering/caching.md
