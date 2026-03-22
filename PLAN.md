# Memex Requirements

## 1. Overview

**Purpose:** Personal knowledge management system that extends memory across sessions using AI agents (OpenCode, Claude Code). Semantic search via qmd, persistent memory across sessions, and local documentation.

**Core Principle:** The machine should remember what the human forgets. Agents retrieve rather than guess.

---

## 2. Core Components

### 2.1 Documentation (`docs/`)

| Property | Requirement |
|----------|-------------|
| Location | Configurable path (default: `docs/`) |
| Format | Markdown files |
| Indexing | qmd semantic search (required) |
| Git status | NOT tracked (gitignored) |
| Structure | User-defined (e.g., by topic/project) |

**Note:** Docs contain personal notes and potentially sensitive information. Gitignored to prevent accidental exposure to GitHub.

### 2.2 Memory System (`.agents/memory/`)

Inspired by OpenClaw's two-layer memory system:

| File/Directory | Purpose | When to Write |
|----------------|---------|---------------|
| `MEMORY.md` | Curated long-term memory | Decisions, preferences, durable facts |
| `daily/` | Daily logs | Day-to-day notes, running context |

**Memory File Definitions:**

| File | When to Write |
|------|---------------|
| `MEMORY.md` | Architectural choices, product decisions, conventions, preferences |
| `daily/YYYY-MM-DD.md` | Notes from today's session, context, observations |

**Session Start Behavior:**
1. Read today's daily log (`daily/YYYY-MM-DD.md`)
2. Read yesterday's daily log (`daily/YYYY-MM-DD.md`)
3. Read `MEMORY.md` (curated, important stuff)

**Note:** Memory files contain private insights and decisions. Gitignored for privacy.

### 2.3 Memory Templates (`.agents/memory.templates/`)

| Property | Requirement |
|----------|-------------|
| Location | `.agents/memory.templates/` |
| Git status | Tracked (committed to repo) |
| Purpose | Starter templates for new machines/sessions |
| Content | Empty files with headers only |

**Template files:**

```
.agents/memory.templates/MEMORY.template.md
.agents/memory.templates/daily.template.md
```

### 2.4 Skills System (`.agents/skills/`)

| Property | Requirement |
|----------|-------------|
| Location | `.agents/skills/` |
| Structure | One directory per skill, each with `SKILL.md` |
| Git status | Tracked |
| Symlinks | Auto-symlinked to `.opencode/skills/` and `.claude/skills/` |

**Skills:**

| Skill | Purpose |
|-------|---------|
| `docsearch` | Search and answer from docs with citations |
| `memsearch` | Search and answer from memory with citations (supports time filtering) |

### 2.5 Agent Configuration

| Property | Requirement |
|----------|-------------|
| Source of truth | `.agents/AGENTS.md` |
| Symlinks | `.opencode/AGENTS.md` → `.agents/AGENTS.md` |
| | `.claude/AGENTS.md` → `.agents/AGENTS.md` |
| Path format | Absolute paths for symlinks |

---

## 3. Setup/Bootstrap Process

### 3.1 Entry Point

```
bun run setup.ts
```

or

```
./setup.sh
```

### 3.2 Setup Responsibilities

The setup process MUST handle:

| Responsibility | Action |
|----------------|--------|
| Load config | Read `config.json`, validate schema, prompt for values if missing |
| Create directories | `docs/`, `.agents/memory/`, agent dirs |
| Bootstrap agents | Create symlinks for AGENTS.md and skills |
| Initialize memory | Copy templates from `.agents/memory.templates/` to `.agents/memory/` |
| Configure qmd | Write `~/.config/qmd/index.yml` with both collections |
| Index docs | Run `qmd update && qmd embed` for both collections |

### 3.3 Setup Constraints

- **Idempotent:** Running setup multiple times must not break anything
- **Fail-safe:** If setup fails, leave system in recoverable state
- **One-way templates:** Templates are source, memory files are derived
- **No duplication:** Memory files exist in one place only (`.agents/memory/`)

### 3.4 Configuration Schema

```json
{
  "user": "string (required)",
  "description": "string (required, for qmd context)",
  "docsPath": "string (default: 'docs')"
}
```

### 3.5 qmd Configuration

```yaml
collections:
  memex-docs:
    path: /path/to/docs
    pattern: "**/*.md"
    context:
      "": [user description]
  memex-memory:
    path: /path/to/.agents/memory
    pattern: "**/*.md"
```

### 3.6 Gitignore Requirements

```
# System files
.DS_Store
Thumbs.db

# Project files
docs
config.json
node_modules
bun.lock

# Agents
.claude
.opencode

# Memory (runtime, not versioned)
.agents/memory/*.md
.agents/memory/daily/

# Templates are tracked (empty starters)
!.agents/memory.templates/
.agents/memory.templates/
```

---

## 4. Data Flows

### 4.1 New Machine Setup

```
git clone → run setup → fresh .agents/memory/ from templates → start using
```

### 4.2 Memory Write Flow

```
User says "remember X" → determine if durable fact or daily note
  → durable fact: append to MEMORY.md
  → daily note: append to daily/YYYY-MM-DD.md
```

**Graceful degradation:** If today's daily log doesn't exist, create it and continue (no error).

### 4.3 Search Flow

```
User question → docsearch or memsearch skill
  → docsearch: qmd query -c memex-docs
  → memsearch: qmd query -c memex-memory (or find+grep for time filtering)
  → Return answer with citations
```

---

## 5. Skills Detail

### docsearch

- Search `memex-docs` collection via qmd
- Fall back to grep for simple queries
- Return answer with docs citations
- Graceful degradation if collection empty

### memsearch

- Search `memex-memory` collection via qmd
- Support time-filtered queries ("last 3 days", "this week", "March 2026")
- Use `find + grep` for date-filtered searches
- Return answer with memory citations and dates
- Graceful degradation if no files exist

---

## 6. Anti-Patterns to Avoid

| Anti-Pattern | Why | Correct Approach |
|--------------|-----|------------------|
| Symlinks with relative paths | Break when directory structure changes | Always use absolute paths |
| Multiple copies of same content | Drift, merge conflicts | Single source, symlinks |
| Setup mixing concerns | Hard to debug, test, modify | Single responsibility per function |
| Gitignore with exceptions | Confusing, fragile | Clear exceptions, documented |
| Hardcoding agent names | Assumes fixed agents | Configurable |
| Modifying global tools (qmd) | Breaks other setups, risky | Document workaround instead |

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Setup time | < 30 seconds |
| Memory file size | < 1MB each (warn if larger) |
| qmd index time | < 60 seconds for 1000 docs |
| Symlink validation | On every setup run |
| Portability | Works on macOS, Linux |

---

## 8. Open Questions

1. **Error handling:** Should setup abort on first error or try to complete as much as possible?

2. **Validation:** Should there be a `memex doctor` command to verify setup is correct?

3. **Upgrade path:** When templates change, should existing users be prompted to update?

4. **Memory expiration:** Should old memory entries be archived or deleted after some period?
