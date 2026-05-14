---
name: future
description: Forward-looking briefing from today through the next 7 days. Shows what's planned, open tasks, and key dates ahead.
---

## Overview

Produce a forward-looking briefing covering today and the next 7 days. Surfaces what's planned, open tasks, and anything coming up worth knowing about.

## Process

1. Read `{{docsPath}}/agents/MEMORY.md`
2. Read `{{docsPath}}/agents/WORK-MEMORY.md`
3. Read today's daily note: `{{docsPath}}/daily/$TODAY.md`
4. Find and read all daily notes in `{{docsPath}}/daily/` with dates from today through the next 7 days (use `ls` sorted, filter by date)
5. Produce the **Forward Briefing**

---

## Forward Briefing Format

```
## This Week
Day-by-day view from today through the next 7 days. For each day that has a note, show the day name + date as a subheader, then a compact summary: tasks (verbatim) and any plans or events. Skip days with no note.

## Open Tasks
All unchecked tasks (- [ ]) across today and all future notes, grouped by day. Nothing dropped.

## Key Dates
Deadlines, events, or named dates pulled from notes and WORK-MEMORY. Each entry: date + what it is.

## On the Horizon
Trips, goals, recurring commitments, or anything further out worth keeping in view.
```

---

## TLDR Rules (per-day summaries in This Week)

- **Tasks / checkboxes**: preserve verbatim
- **Plans / events**: keep as-is
- **Longer prose**: summarize to 1 sentence — don't drop the topic

Always preserve section headers within each day summary.

---

## Output

Start with a short friendly greeting — "Hey Kevin," followed by 1–2 sentences oriented toward what's ahead. Then the Forward Briefing.
