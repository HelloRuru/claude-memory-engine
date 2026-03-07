---
name: memory-engine
description: Memory Engine for Claude Code -- fuses smart-context auto-loading, auto-learn pitfall detection, reflection diary, and memory health checks into a single skill. Built with hooks and markdown, zero dependencies.
---

# Memory Engine

A memory management skill for Claude Code that fuses concepts from three open-source tools into one cohesive system.

## What It Does

### 1. Smart Context (inspired by contextstream)

Automatically loads relevant memory files based on your working directory when a new session starts.

### 2. Auto Learn (inspired by contextstream)

Detects "pitfall patterns" in your conversation (retries, errors, user corrections) and saves lessons learned.

### 3. Diary + Reflect (inspired by claude-diary)

On-demand commands to create reflection diaries and analyze patterns across sessions.

### 4. Memory Health (inspired by claude-brain)

Check the health of all memory files -- line counts, staleness, capacity warnings.

## Hooks

| Hook Type | File | Function |
| --------- | ---- | -------- |
| SessionStart | session-start.js | Smart context + session recall + pitfall review |
| SessionEnd | session-end.js | Session summary + auto-learn pitfall detection |
| UserPromptSubmit | memory-sync.js | Cross-session memory change detection |
| PreToolUse(Write) | write-guard.js | Sensitive file write warning |
| PreToolUse(Bash) | pre-push-check.js | Git push safety check |

## Commands

| Command | Function |
| ------- | -------- |
| /diary | Write a reflection diary from this session |
| /reflect | Analyze recent diaries and suggest improvements |
| /memory-health | Check health of all memory files |

## References

- `references/smart-context.md` -- CWD to memory file mapping
- `references/auto-learn.md` -- Pitfall detection rules
