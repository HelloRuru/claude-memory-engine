# /recover -- Disaster Recovery

Restore memory from your GitHub backup when local memory files are lost or corrupted.

## Prerequisites

You need a GitHub repo set up as your memory backup (the one you push to with `/backup` or `/sync`). If you haven't created a backup repo yet, this command won't work.

## When to Use

- Switched to a new computer
- Local memory files were accidentally deleted
- SessionStart hook isn't working
- Memory files appear corrupted or empty

## Steps

1. **Protect current state** -- Run `/sync` first to push any remaining local changes
2. **Pull from GitHub** -- Clone or pull the latest from your GitHub memory repository (`~/.claude/claude-memory/` or your configured path)
3. **Verify** -- Read MEMORY.md, scan all index entries
4. **Report** -- "Recovered! Found {N} index entries, {M} memory files"

## Notes

- Under normal conditions, SessionStart hook auto-loads the last session summary + recent memory changes. You should NOT need this command regularly
- This is the "break glass" option for when the automated system fails
- Always push before pulling to avoid overwriting local changes
