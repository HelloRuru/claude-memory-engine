# /reflect -- Reflection Analysis

Analyze recent diary entries and session records to find patterns and suggest improvements.

## Steps

1. **Read recent diaries**: Scan `~/.claude/sessions/diary/` (last 7 days)
2. **Read session summaries**: Scan `~/.claude/sessions/` for recent records
3. **Read pitfall records**: Scan `~/.claude/skills/learned/auto-pitfall-*.md`
4. **Analyze patterns**:
   - What type of work does the user do most?
   - Which pitfalls keep recurring? Should they be added to CLAUDE.md?
   - Any new preferences or rules to record?
   - Any outdated MEMORY.md entries to clean up?
5. **Suggest changes**: List specific update suggestions for user confirmation

## Output Format

```
Reflection Report ({date range})

Work stats:
- X sessions total, most active project: {name}
- Most used tools: {list}

Patterns found:
1. {pattern} -> Suggestion: {action}
2. ...

Pitfall stats:
- Recurring: {description} -> Suggest adding to CLAUDE.md
- Resolved: {description} -> Can be archived from learned/

Suggested updates:
- [ ] Add to CLAUDE.md: {new rule}
- [ ] Update MEMORY.md: {which HOOK}
- [ ] Remove outdated: {which files}
```

## Notes
- Only suggest changes, never auto-modify CLAUDE.md (user must confirm)
- Keep the report clear and actionable
