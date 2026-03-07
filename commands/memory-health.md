# /memory-health -- Memory Health Check

Check the health status of all memory files and hooks.

## Steps

1. **Scan memory directory**: `~/.claude/projects/{project-id}/memory/`
2. **Scan sessions directory**: `~/.claude/sessions/`
3. **Scan diary directory**: `~/.claude/sessions/diary/`
4. **Scan learned directory**: `~/.claude/skills/learned/`
5. **Check debug log**: `~/.claude/sessions/debug.log`

## Output Format

```
Memory Health Report

MEMORY.md level: {lines}/200 ({percent}%) {Safe/Warning/Critical}

Memory files:
| File | Lines | Last Updated | Status |
|------|-------|-------------|--------|
| {filename} | {lines} | {date} | {OK/Stale/Too Large} |

Sessions: {N} total, latest: {date}
Diary entries: {N} total, latest: {date}
Pitfall records: {N} total, latest: {date}
Learned Skills: {N} total

Hooks status:
- session-start.js: {OK/Error}
- session-end.js: {OK/Error} (debug.log last: {msg})
- memory-sync.js: {OK}
- write-guard.js: {OK}
- pre-push-check.js: {OK}
```

## Thresholds
- MEMORY.md < 170 lines -> Safe
- MEMORY.md 170-200 lines -> Warning, suggest moving content to topic files
- MEMORY.md > 200 lines -> Critical, content beyond line 200 is truncated by Claude
- Memory file not updated for 30+ days -> Stale
- Memory file over 200 lines -> Too Large
