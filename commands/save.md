# /save -- Save Memory Across Sessions

Store information so the next session's Claude knows about it. The core mission: **make sure the next conversation doesn't lose this knowledge.**

## Steps

1. **Dedup check** -- Search existing memory files (`memory/*.md`) for related content. If found, update that section instead of creating a new entry
2. **Route to the right file** -- Determine which memory file this belongs to based on topic. If unclear, ask the user
3. **Skip if already in CLAUDE.md** -- CLAUDE.md is auto-loaded every session, so don't duplicate its content
4. **Never write directly to MEMORY.md** -- MEMORY.md is an index of pointers, not a content store. Save content to topic-specific files in `memory/`
5. **Report** -- Tell the user: "Saved to {filename}, section {section name}" or "Updated {filename}, changed {what}"

## Memory File Organization

Memory uses a **hub-and-spoke** model:
- `MEMORY.md` = the hub (index with pointers to topic files, max 200 lines)
- `memory/*.md` = the spokes (topic-specific content files)

When MEMORY.md exceeds 170 lines, proactively suggest moving content to separate files.

## Notes

- User says "save" or "remember this" -> just save it, don't question it
- Always check for duplicates before creating new entries
- Use natural language, not technical jargon
