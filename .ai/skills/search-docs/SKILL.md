---
name: search-docs
description: Search the documentation corpus using qmd for semantic and keyword search.
---

## Overview

Use this skill to search markdown documentation in the `/docs` folder using qmd (a local search engine with BM25, vector, and hybrid search).

## When to Use

- User asks about something that might be in docs
- You need to find information about a topic
- Before answering a question (as part of answer-question workflow)

## Prerequisites

- qmd must be installed: `bun install -g @tobilu/qmd`
- Docs must be indexed: `qmd update`

---

## Basic Search

### Query Command

```bash
qmd query "your search terms" -c memex
```

This performs hybrid search (BM25 + vector + reranking) and returns ranked results with scores.

---

## Search Options

### Number of Results

```bash
# Default is 5 results
qmd query "search" -c memex -n 10

# Get all matches above threshold
qmd query "search" -c memex --all --min-score 0.3
```

### Search Modes

```bash
# Hybrid (default) - best quality
qmd query "search" -c memex

# BM25 only - fast keyword search
qmd search "keyword" -c memex

# Vector only - semantic similarity
qmd vsearch "concept" -c memex
```

### Collection-Specific

```bash
# Search specific folder
qmd query "search" -c memex -c docs
```

---

## Understanding Results

### Output Format

Each result shows:
- **File path**: Location in docs
- **Score**: Relevance (0-100%)
- **Snippet**: Relevant excerpt

### Score Interpretation

| Score | Meaning |
|-------|---------|
| 70-100% | Strong match - use confidently |
| 40-70% | Moderate match - verify with context |
| 0-40% | Weak match - be skeptical |

---

## Get Full Document

If you need more context from a result:

```bash
# Get document by path
qmd get docs/path/to/file.md

# Get by docid (from search results)
qmd get #abc123

# Get with line numbers
qmd get docs/file.md --line-numbers

# Get specific lines
qmd get docs/file.md:50 -l 100
```

---

## Reindexing

If search results seem stale or missing content:

```bash
# Update index after docs change
qmd update
```

---

## Examples

### Basic

```bash
qmd query "authentication" -c memex
```

### With More Results

```bash
qmd query "API design" -c memex -n 10
```

### Find Specific File

```bash
qmd query "auth token" -c memex | head -20
```

---

## Troubleshooting

### No Results

- Try different keywords
- Try broader terms
- Reindex: `qmd update`

### Poor Results

- Use `--explain` to see scoring details
- Try BM25 (`qmd search`) for exact matches
- Try vector (`qmd vsearch`) for concepts
