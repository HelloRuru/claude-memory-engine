# /check -- Quick Health Check

Run a quick scan of the memory system's health. For daily use.

## Usage

- `/check` -- Scan everything (default)
- `/check memory` -- Only check memory files (capacity, orphans, broken links)
- `/check commands` -- Only check command files (duplicates, broken paths)
- `/check hooks` -- Only check hook scripts (exist, readable, configured)
- `/check {project}` -- Only check a specific project's memory files

## What It Checks (Full Scan)

### 1. Memory File Structure
- Does each memory file exist and is it readable?
- Are index entries in MEMORY.md pointing to real files?

### 2. MEMORY.md Capacity
- Line count vs. 200-line system limit
- Below 170 = safe, 170-200 = warning, above 200 = danger (content truncated)

### 3. Duplicate Content
- Same rule or fact appearing in multiple files
- Identify the "single source of truth" for each piece of information

### 4. Size Check
- Memory files over 200 lines -> suggest splitting
- Reference files over 300 lines -> suggest splitting

### 5. Orphan Check
- Memory files not indexed by MEMORY.md (orphans)
- MEMORY.md entries pointing to non-existent files (broken links)

### 6. Environment Status
- CLAUDE.md: exists and readable?
- MEMORY.md: line count and capacity
- commands/: how many commands
- skills/learned/: how many skills
- memory/: how many memory files

## Output Format

```
=== Quick Health Check ===

Environment:
- CLAUDE.md: OK ({N} lines)
- MEMORY.md: OK/WARNING ({N}/200 lines)
- commands/: {N} commands
- skills/learned/: {N} skills
- memory/: {N} files

Index:
- [OK] All MEMORY.md entries point to existing files
- [BROKEN] {entry} points to non-existent {file}

Size:
- [OK] All files within limits
- [WARNING] {file} has {N} lines, suggest splitting

Suggestions:
1. ...
2. ...
```

## Notes

- List suggestions but do NOT auto-modify any files
- Wait for user confirmation before making changes
