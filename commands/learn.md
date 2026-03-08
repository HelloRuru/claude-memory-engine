# /learn -- Auto-Learn from Mistakes

Automatically detect and save pitfall experiences during work sessions.

## When to Trigger (Claude decides on its own)

1. **Pitfall resolved** -- Tried the wrong approach, eventually found the fix
2. **Non-obvious workaround** -- Browser quirks, library limitations, platform-specific behavior
3. **Path/environment traps** -- Windows path issues, `~` resolution errors, cross-platform differences
4. **Deployment gotchas** -- Hosting platform quirks, cache issues, DNS delays
5. **3+ attempts to solve** -- If it took 3+ tries, it's worth recording

## What NOT to Learn

- Settings already documented in CLAUDE.md or project docs
- Common CSS/HTML patterns (easily searchable)
- One-off fixes that won't happen again

## Save Format

Save to `~/.claude/skills/learned/{pattern-name}.md`:

```markdown
# {Descriptive Title}

**Date:** {today}
**Project:** {which project}

## Problem
{What happened, what context}

## Solution
{How it was fixed}

## Next Time
{What situation should remind you of this}
```

## Behavior

- After saving, briefly tell the user: "Learned: {title}"
- Don't write a long explanation of why it was saved
- Learn quietly, don't interrupt the workflow
