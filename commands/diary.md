# /diary -- Session Reflection Diary

Generate a reflection diary entry from the current conversation.

## Steps

1. **Review this conversation**: List the user's main requests, problems solved, and files modified
2. **Write a diary entry**: Save to `~/.claude/sessions/diary/` with date-based filename
3. **Format**:

```markdown
# Diary {YYYY-MM-DD}

## What I did today
- {List main work items}

## What I learned
- {Pitfalls, discoveries, user preferences}

## Patterns I noticed
- {User's work patterns, recurring needs}

## Notes for next time
- {Reminders for future sessions}
```

4. **Report**: Briefly say "Diary written, noted X key points"

## Notes
- Keep it concise and actionable, not a verbose log
- Focus on "what I learned" and "patterns", not play-by-play
- Each entry should be under 30 lines
