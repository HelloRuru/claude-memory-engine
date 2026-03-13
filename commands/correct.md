---
description: "Review the error notebook — flip through past corrections before working"
---

# /correct — Review Error Notebook

Scan your error notebook and remind yourself what you've gotten wrong before.

## Steps

1. **Load the error notebook** — Read `~/.claude/skills/learned/writing-review-list.md`
2. **Filter active items** — Skip items marked `cleared`, only show `active` ones
3. **Group by category** — Group corrections by type (tone, structure, terminology, formatting, etc.)
4. **Summarize** — List each active rule with its miss count, most recent example
5. **Flag repeat offenders** — Anything missed 3+ times gets highlighted as "needs hard rule"
6. **Report** — "N active corrections. Top risks: [list the ones missed most often]."

## When to run

- Runs **automatically** before each task (you don't need to type anything)
- Type `/correct` **anytime** to manually review — no need to wait for a task or a cycle
