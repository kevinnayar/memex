---
name: write-memory
description: Write new knowledge to the memory system for persistent storage.
---

## Overview

The memory system stores knowledge that persists across sessions. Memory is for information that will be useful again but isn't ready for docs.

## Memory Files

| File | When to Use |
|------|--------------|
| `.ai/memory/decisions.md` | Architectural choices, product decisions, important conclusions |
| `.ai/memory/patterns.md` | Coding conventions, recurring solutions, standards |
| `.ai/memory/notes.md` | Debugging insights, quirks, observations, personal context |

## When to Write

Write to memory ONLY when ALL of these are true:

- ✅ Information will be useful again in the future
- ✅ Not already in `docs/`
- ✅ Represents a decision, pattern, or insight
- ✅ Not trivial Q&A or one-off answers

## When NOT to Write

- ❌ Trivial Q&A
- ❌ Redundant documentation
- ❌ One-off answers
- ❌ Information that belongs in docs
- ❌ Guesses or assumptions

## How to Write

### Step 1: Choose the Right File

Use this decision tree:

```
Is it a decision/conclusion? → decisions.md
  ↓ No
Is it a pattern/convention? → patterns.md
  ↓ No
Is it useful context/insight? → notes.md
```

### Step 2: Append New Entry

Always APPEND - never overwrite or delete existing entries.

Format:

```markdown
## YYYY-MM-DD - Title

<content>

Optional fields:
- Reason: why this matters
- Implications: downstream effects
```

### Step 3: Include Date

Always start new entries with current date in `YYYY-MM-DD` format.

## Entry Templates

### For Decisions

```markdown
## 2026-03-17 - [Decision Title]

[What was decided]

Reason:
- [Why this choice was made]

Implications:
- [What this affects]
```

### For Patterns

```markdown
## 2026-03-17 - [Pattern Name]

[What the pattern is]

When to use:
- [Use case 1]
- [Use case 2]

Example:
\`\`\`
[code example]
\`\`\`
```

### For Notes

```markdown
## 2026-03-17 - [Note Title]

[Observation or insight]

Context:
[When this applies]
```

## Examples

**Saving a decision:**
```bash
echo '## 2026-03-17 - Auth Token Strategy

We standardized on JWT v2 tokens.

Reason:
- simpler backend validation
- works with mobile clients

Implications:
- refresh tokens required' >> .ai/memory/decisions.md
```

**Saving a pattern:**
```bash
echo '## 2026-03-17 - Error Handling Pattern

Always return structured errors:
{ "error": "code", "message": "human readable", "details": {}}' >> .ai/memory/patterns.md
```

## Post-Write

After writing, confirm:
```
✓ Saved to .ai/memory/[file].md
```
