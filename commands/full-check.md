# /full-check -- Comprehensive Health Check

Run a thorough scan of the entire memory ecosystem. Recommended weekly or after major changes.

## Usage

- `/full-check` -- Full audit of everything (default)
- `/full-check commands` -- Deep audit of command layer only
- `/full-check memory` -- Deep audit of memory files only
- `/full-check git` -- Only check git repo status across all projects
- `/full-check {project}` -- Full audit scoped to a specific project

Includes everything from `/check` (quick health check) plus the following:

## Additional Checks

### 7. Command Layer
- List all commands, map each to its function
- Detect overlapping commands (similar function, different name)
- Verify all file paths referenced in commands still exist
- Flag outdated commands referencing deleted files

### 8. Memory File Audit
- Every memory file: is it indexed in MEMORY.md? (find orphans)
- Every MEMORY.md entry: does the target file exist? (find broken links)
- Cross-file duplicate content detection
- Line counts for all files (flag files over 300 lines)
- Verify internal path references are still valid

### 9. Cross-Reference Integrity
- Full chain: MEMORY.md -> memory/*.md -> skills -> references/
- Check for rules duplicated between CLAUDE.md and MEMORY.md (should live in only one place)
- Check for conflicting trigger phrases across commands and skills

### 10. Environment Config
- `~/.claude/settings.json` -- hooks configuration present?
- `~/.claude/scripts/hooks/` -- all hook scripts exist and readable?
- `~/.claude/sessions/` -- session directory exists?
- `~/.claude/skills/learned/` -- skills directory exists?

### 11. Git Repository Status
- Scan known repositories (from project config)
- Each repo: uncommitted changes? Behind remote?
- Flag repos with dirty working trees

## Output Format

```
=== Full Health Check ===

--- Basic (same as /check) ---
{Quick health check output}

--- Commands ---
- commands/: {N} commands
- [OK] diary.md -- reflection diary
- [WARNING] {file} -- overlaps with {other file}
- [BROKEN] {file} -- references non-existent path

--- Memory Files ---
- memory/: {N} files, {total} lines
- [OK] {file} ({N} lines) -- indexed in MEMORY.md
- [ORPHAN] {file} -- not in MEMORY.md index
- [FAT] {file} has {N} lines, suggest splitting

--- Cross-References ---
- [OK] MEMORY.md -> memory/ -> skills -> references/ chain intact
- [DUPLICATE] "{rule}" appears in both CLAUDE.md and MEMORY.md
- [CONFLICT] trigger "{phrase}" used by both {cmd A} and {skill B}

--- Environment ---
- settings.json: OK (hooks configured)
- hooks/: {N} scripts
- sessions/: OK
- skills/: OK

--- Git Repos ---
- [CLEAN] {repo} -- synced with remote
- [DIRTY] {repo} -- {N} uncommitted files
- [BEHIND] {repo} -- {N} commits behind remote

Suggestions:
1. ...
2. ...
```

## Notes

- List all findings and suggestions but do NOT auto-modify any files
- Wait for user confirmation before making changes
- Keep the report scannable -- use [OK], [WARNING], [BROKEN] tags consistently
