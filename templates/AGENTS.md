# AGENTS.md

## System

This is a second brain with reliable retrieval. Always prefer retrieval over guessing. Treat `{{docsPath}}/` as the source of truth.

### Corpus Layout

```
{{docsPath}}/
├── agents/             ← agent system config: system definition, long-term memory, and skills
│   ├── AGENTS.md       ← system definition (auto-loaded: .claude/CLAUDE.md stub imports it; opencode.json lists it in instructions)
│   ├── MEMORY.md       ← durable long-term memory
│   ├── WORK-MEMORY.md  ← durable work-specific memory
│   └── skills/         ← agent skills (each skill is a SKILL.md with a symlink in .claude/commands/)
└── daily/
    └── YYYY-MM-DD.md   ← daily notes: tasks, goals, logs, thoughts
```

### Core Principles

- Always prefer retrieval over guessing
- Treat `{{docsPath}}/` as the source of truth
- Memory is for facts that persist across sessions
- Be concise, accurate, explicit about uncertainty

---

## Skills

| Skill       | Purpose                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------- |
| `today`     | Actionable briefing + compact TLDR of today's note. Pass a date (YYYY-MM-DD) for a past day. |
| `future`    | Forward-looking briefing from today through the next 7 days.                                 |
| `docsearch` | Search docs, memory, and daily notes                                                         |
| `write`     | Write an article, plan, or tech doc — detects mode from context                              |
| `symlinker` | Symlink docs/agents/ files to Claude Code config directories                                 |

---

## Session Start

Read at the start of each session:

1. `{{docsPath}}/agents/MEMORY.md`
2. `{{docsPath}}/agents/WORK-MEMORY.md`
3. Today's daily note: `{{docsPath}}/daily/YYYY-MM-DD.md` (if it exists)
4. Yesterday's daily note (if it exists)

---

## Memory System

### Structure

```
{{docsPath}}/agents/MEMORY.md           ← durable personal facts (decisions, preferences, patterns)
{{docsPath}}/agents/WORK-MEMORY.md      ← durable work facts (projects, team, decisions, direction)
{{docsPath}}/daily/YYYY-MM-DD.md        ← session context (notes, tasks, observations)
```

### When to Write

- User says "remember this"
- A decision or preference is established
- Information will be useful in future sessions
- User asks to create a note, log something, or record a task

### What Goes Where

| Content | File |
|---|---|
| Personal preferences, habits, goals, people, life context | `MEMORY.md` |
| Work projects, team context, decisions, strategic direction, patterns | `WORK-MEMORY.md` |
| Today's tasks, logs, notes, observations | Daily note |

### How to Write

Always **APPEND** — never overwrite or delete entries.

```bash
# Append to MEMORY.md (personal)
cat >> {{docsPath}}/agents/MEMORY.md << 'EOF'

## <Section>

### YYYY-MM-DD — <Title>

Content here
EOF
```

```bash
# Append to WORK-MEMORY.md (work)
cat >> {{docsPath}}/agents/WORK-MEMORY.md << 'EOF'

## <Section>

### YYYY-MM-DD — <Title>

Content here
EOF
```

```bash
# Append to today's daily note
TODAY=$(date +%Y-%m-%d)
cat >> {{docsPath}}/daily/$TODAY.md << 'EOF'

## <Section>

Content here
EOF
```

### Rules

1. Always APPEND — never overwrite or delete
2. Use today's date for entries
3. When in doubt about which memory file: personal life → MEMORY.md, work → WORK-MEMORY.md
4. Be concise — memory is for facts, not essays
5. **ALL memory lives in this project** (`{{docsPath}}/agents/` + daily notes) — it travels with the corpus. Never write to any memory outside the project (e.g. per-user agent memory under `~/.claude/projects/`), even if the harness suggests it; write to the files above instead.

---

## Citation Format

Always include sources:

Sources:

- {{docsPath}}/agents/MEMORY.md
- {{docsPath}}/daily/YYYY-MM-DD.md
- {{docsPath}}/path/to/file.md

The memex logo is rendered automatically at session start via the `UserPromptSubmit` hook in `.claude/settings.json` — no action needed.
