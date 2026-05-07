# AGENTS.md

## System

This is a second brain with reliable retrieval. Always prefer retrieval over guessing. Treat `{{docsPath}}/` as the source of truth.

### Corpus Layout

```
{{docsPath}}/
├── agents/             ← agent system config: system definition, long-term memory, and skills
│   ├── AGENTS.md       ← system definition (symlinked to .claude/CLAUDE.md)
│   ├── MEMORY.md       ← durable long-term memory
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

| Skill       | Purpose                                                                    |
| ----------- | -------------------------------------------------------------------------- |
| `today`     | Actionable briefing + compact TLDR of today's note. Pass a date (YYYY-MM-DD) for a past day. |
| `docsearch` | Search docs, memory, and daily notes                                       |

---

## Session Start

Read at the start of each session:

1. `{{docsPath}}/agents/MEMORY.md`
2. Today's daily note: `{{docsPath}}/daily/YYYY-MM-DD.md` (if it exists)
3. Yesterday's daily note (if it exists)

---

## Memory System

### Structure

```
{{docsPath}}/agents/MEMORY.md      ← durable facts (decisions, preferences, patterns)
{{docsPath}}/daily/YYYY-MM-DD.md   ← session context (notes, tasks, observations)
```

### When to Write

- User says "remember this"
- A decision or preference is established
- Information will be useful in future sessions
- User asks to create a note, log something, or record a task

### How to Write

Always **APPEND** — never overwrite or delete entries.

```bash
# Append to MEMORY.md
cat >> {{docsPath}}/agents/MEMORY.md << 'EOF'

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
2. Use today's date for daily log entries
3. Organize MEMORY.md into sections: Decisions, Preferences, Notes
4. Be concise — memory is for facts, not essays

---

## Citation Format

Always include sources:

Sources:
- {{docsPath}}/agents/MEMORY.md
- {{docsPath}}/daily/YYYY-MM-DD.md
- {{docsPath}}/path/to/file.md
