---
name: today
description: Show today's daily note with an actionable briefing. Pass a date (YYYY-MM-DD) to view a specific day.
---

## Overview

When called with no argument (or "today"), produce a full daily briefing followed by a compact TLDR of today's note.
When called with a past date, show only the TLDR of that day's note.

## Process

### Determine target date
- If an argument looks like a date (YYYY-MM-DD), use it as the target date and set `past_date = true`
- Otherwise use today's date and set `past_date = false`

### If `past_date = true`
1. Read `{{docsPath}}/daily/$DATE.md`
2. If the file doesn't exist, say so
3. If it exists, show the **TLDR** only (see TLDR rules below)

### If `past_date = false` (today)
1. Read today's daily note: `{{docsPath}}/daily/$DATE.md`
2. Read the last 7 daily notes for context (find the most recent files in `{{docsPath}}/daily/`)
3. Produce the **Briefing** (see below)
4. Then produce the **TLDR** of today's note

---

## Briefing Format (today only)

```
## Focus
1–3 things that seem most important or stuck. What to actually work on today.

## Accomplishments
Tasks checked off (- [x]) from the past 7 days. Tight list.

## Carrying Forward
Tasks that have appeared unchecked (- [ ]) across multiple days.
Note how many days each has been open — no judgment, just signal.

## Observations
Anything else worth surfacing: exercise trends, upcoming events, recurring themes, things coming up soon.
```

---

## TLDR Rules

The TLDR is a compact but **non-lossy** version of the day's note. Apply these rules section by section:

- **Tasks / Goals / Checkboxes** (`- [ ]`, `- [x]`): preserve **verbatim**, every line, nothing dropped
- **Exercise logs**: preserve verbatim — sets, reps, weights are actionable
- **Short prose** (1–3 sentences): keep as-is
- **Longer prose sections** (Memories, Notes, meeting details, reflections): summarize to 1–2 sentences — capture the key point, don't drop the topic

Always preserve section headers so the note stays navigable.

---

## Output

For today: Start with a short friendly greeting followed by 1–2 sentences that are warm but to the point. Make it feel natural and contextual (reference the day, something from the note, the week ahead) — not a template. Then the Briefing, then a `---` divider, then `## Today's Note` with the TLDR.

For a past date: Just the TLDR under a header with the date. No greeting needed.
