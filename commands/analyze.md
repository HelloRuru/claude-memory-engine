---
description: "Analyze user corrections and log them into the error notebook"
---

# /analyze — Record Corrections

Compare the user's edits against your output. Find what you got wrong and why.

## Steps

1. **Find the diff** — Identify what the user changed in your output (text, code, structure, tone)
2. **Check against rules** — Compare each correction against existing rules in CLAUDE.md, memory files, and learned skills
3. **Log missed rules** — If a rule exists but you didn't follow it, log it with a count (e.g., "2nd time missing this")
4. **Distill new patterns** — If the correction doesn't match any existing rule, distill it into a new one
5. **Save to error notebook** — Append to `~/.claude/skills/learned/writing-review-list.md` (or project-specific file)
6. **Report** — Tell the user: "Logged N corrections. M were known rules I missed, K are new patterns."

## Error notebook format

```markdown
### Rule name
- **Rule:** What to do
- **Missed:** N times
- **Status:** active / cleared
- **Example:** What went wrong → what was correct
```

## When to run

Run this right after the user corrects your work. The fresher the context, the better the analysis.
