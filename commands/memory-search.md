# /memory-search -- Search Memory Files

Search across all memory files by keyword.

## Usage

`/memory-search {keyword}`

## Steps

1. **Identify search scope**: Scan these directories for `.md` files:
   - `~/.claude/projects/{current-project-id}/memory/`
   - `~/.claude/sessions/diary/`
   - `~/.claude/skills/learned/`
   - `~/.claude/sessions/` (session summaries)

2. **Search**: Use Grep to find the keyword across all `.md` files in those directories

3. **Report results**:

```
Memory Search: "{keyword}"

Found {N} matches in {M} files:

{filename}:{line_number} — {matching line preview}
{filename}:{line_number} — {matching line preview}
...
```

4. If no results: suggest related keywords or broader search terms

## Notes
- Case-insensitive search
- Show max 20 results, sorted by most recently modified file first
- Truncate long lines to 120 characters
- If the keyword is in Chinese, also search for related terms
