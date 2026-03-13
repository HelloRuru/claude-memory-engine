---
description: "Create a handoff file for another session to pick up"
---

# Session Handoff

Generate a handoff file so another Claude Code session can continue where this one left off.

## Steps

1. **Analyze current session** — What are you working on right now? What files have been modified? What decisions were made?

2. **Write handoff file** — Save to the project's memory directory as `handoff-{topic}.md` with this format:

```markdown
---
name: handoff-{topic}
description: {one-line summary of what needs to be handed off}
type: project
---

# {Title} Handoff

**Status:** {what's done / what's pending}
**Date:** {today}

## What was done
{bullet list of completed work}

## What's left to do
- [ ] {pending task 1}
- [ ] {pending task 2}

## Key decisions
{any decisions the next session needs to know about}

## Files modified
{list of files changed in this session}
```

3. **Confirm** — Tell the user the handoff file has been saved and will be automatically detected by the next session.

## How it works

- **SessionStart hook** automatically reads all unread `handoff-*.md` files when a new conversation starts
- **memory-sync hook** detects new handoff files appearing mid-conversation and alerts immediately
- Handoff files are tracked in `.handoff-read.json` so they're only shown once
