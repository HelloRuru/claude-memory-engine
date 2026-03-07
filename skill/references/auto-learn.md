# Auto Learn: Pitfall Detection

## Detection Rules

session-end.js scans the conversation transcript and uses these signals to detect "pitfalls":

### Signal 1: Retry 3+ times

Same tool (Edit/Write/Bash) called 3+ times on the same file or with the same parameters.

Detection: Build Map<tool_name + target_file, count>, trigger when count >= 3.

### Signal 2: Error then fix

Tool result contains error keywords, then the same area succeeds later.

Error keywords: error, Error, failed, Failed, FAILED, not found, does not exist, TypeError, SyntaxError

### Signal 3: User correction

User message contains correction keywords.

Keywords: wrong, not this, revert, undo, that's not, go back, not what I

### Signal 4: Back-and-forth editing

Same file edited 3+ times in quick succession with revert behavior.

## Auto-save Format

Detected pitfalls are saved to `~/.claude/skills/learned/auto-pitfall-{date}.md`.

## Notes

- Only saves "resolved" pitfalls (error + fix found). Unresolved ones are not saved
- Runs silently, does not interrupt the user's workflow
- Next session-start will briefly mention "Last time I learned..."
