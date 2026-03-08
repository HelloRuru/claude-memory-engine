# /reload -- Load Memory into Context

Fully load memory files into the current conversation context.

SessionStart hooks inject a brief summary automatically, but `/reload` does the **full read** -- loading actual file contents so Claude can reference specific details.

## Steps

1. **Read MEMORY.md** -- Scan all index entries (usually auto-loaded, but confirm)
2. **Read task file** -- Load `memory/todo-status.md` for current task status
3. **Read recent changes** -- Load files updated in the last 24 hours (up to 3 files)
4. **Report** -- "Loaded. {N} index entries, {M} pending tasks, recently changed: {summary}"

## Targeted Reload

If the user specifies a topic:
- Only load the file(s) related to that topic
- Example: "reload blog" -> only load blog-related memory files

## Notes

- This is a **read** operation -- it doesn't modify any files
- Use when switching to a topic that needs detailed context
- Useful after long conversations where early context was compressed
