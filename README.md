# Claude Memory Engine

> **English** | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

> Every new conversation, Claude forgets everything.
> This Skill makes it remember -- not just what happened last time, but lessons from its own mistakes.

A memory system for Claude Code, built with hooks and markdown. No database, no external API, no mysterious binary files -- just `.js` and `.md` you can actually read.

## What This Skill Does

When you open Claude Code, you usually run into these problems:

- You spent 30 minutes debugging something last session, and this session it makes the exact same mistake
- You told it to "remember" something, next session it's gone
- You're working on Project A, switch to Project B, and it still thinks you're talking about A
- Long sessions get compressed, and important decisions disappear

Memory Engine uses 5 hooks to solve these:

| Hook | When It Runs | What It Does |
| ---- | ------------ | ------------ |
| session-start | Every new conversation | Loads last session's summary + project-specific memory based on your working directory |
| session-end | Every conversation end | Saves what you did, which files changed, and scans for pitfall patterns |
| memory-sync | Every message you send | Detects if memory files were updated by another session, shows what changed |
| write-guard | Before every file write | Warns when writing to `.env`, `credentials`, or other sensitive files |
| pre-push-check | Before every git push | Checks staged files for secrets, extra warning on force push |

Plus 3 commands:

| Command | Function |
| ------- | -------- |
| `/diary` | Generate a reflection diary from this conversation -- what was done, learned, and patterns noticed |
| `/reflect` | Analyze recent diaries and pitfall records, find recurring patterns, suggest improvements |
| `/memory-health` | List all memory files with line counts, last updated dates, and health status |

## Installation

1. Copy files to their locations:

```bash
# Hook scripts
cp hooks/*.js ~/.claude/scripts/hooks/

# Commands
cp commands/*.md ~/.claude/commands/

# Skill definition (optional -- Claude will auto-recognize this Skill)
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

2. Add hooks config to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/session-start.js"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/session-end.js"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/memory-sync.js"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/pre-push-check.js"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/write-guard.js"
          }
        ]
      }
    ]
  }
}
```

3. Create required directories:

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

4. Restart Claude Code.

## Smart Context: Auto-Load Project Memory

`session-start.js` detects which project you're in based on your working directory (CWD) and loads the relevant memory files.

To customize the mapping, edit the `PROJECT_CONTEXT` array in `session-start.js`:

```javascript
const PROJECT_CONTEXT = [
  {
    keywords: ['my-project'],       // CWD contains these keywords
    name: 'My Project',             // Display name
    files: ['project-notes.md'],    // Memory files to load
  },
];
```

Memory files live in `~/.claude/projects/{project-id}/memory/`.

## Auto Learn: Pitfall Detection

`session-end.js` automatically scans each conversation for four "pitfall" patterns:

| Signal | How It's Detected | Example |
| ------ | ----------------- | ------- |
| 3+ retries | Same tool called 3+ times on same file | Edit the same file 4 times |
| Error then fix | Error appears, then same area succeeds | Build fails -> fix code -> build passes |
| User correction | User says "wrong", "not this", "revert" | "That's not the right file" |
| Back-and-forth | Same file edited repeatedly in quick succession | Changed CSS then changed it back |

Detected pitfalls are saved to `~/.claude/skills/learned/auto-pitfall-{date}.md` and reviewed at the start of the next session.

## File Structure

```
claude-memory-engine/
  hooks/
    session-start.js    # New session -> load recall + smart-context
    session-end.js      # Session end -> save summary + detect pitfalls
    memory-sync.js      # Every message -> cross-session memory sync
    write-guard.js      # Before file write -> sensitive file warning
    pre-push-check.js   # Before git push -> safety check
  commands/
    diary.md            # /diary reflection diary
    reflect.md          # /reflect reflection analysis
    memory-health.md    # /memory-health memory health check
  skill/
    SKILL.md            # Skill definition
    references/
      smart-context.md  # CWD to memory file mapping
      auto-learn.md     # Pitfall detection rules
```

## Customization

This Skill is designed to be modified. Common adjustments:

- **Smart Context mapping**: Edit `PROJECT_CONTEXT` in `session-start.js`
- **Pitfall detection keywords**: Edit `correctionKeywords` in `session-end.js`
- **Sensitive file patterns**: Edit `PROTECTED_PATTERNS` in `write-guard.js`
- **Session retention count**: Edit `MAX_SESSIONS` in `session-end.js` (default: 30)

## Design Philosophy

### Why not a database?

Markdown files are human-readable, editable, and git-committable.
No extra packages, no server, no query language to learn.
Claude Code already reads `.md` natively -- why add complexity?

### Why not a Plugin?

Plugins are black boxes -- you're not sure what they changed, stored, or read.
Hooks + Commands are transparent -- every `.js` file is right there for you to inspect, modify, or delete.
Tools should be something you control, not something that controls you.

## Inspiration & Credits

This Skill's concepts were inspired by three open-source projects. To be clear:

**All code was written from scratch. No code was copied, forked, or adapted from any of the projects below.**

I studied what each tool does best, then fused those *concepts* into a new implementation. Like reading menus from three restaurants, then going home and cooking something new with my own ingredients and my own recipe.

| Project | Concept Inspired | Link |
| ------- | ---------------- | ---- |
| [contextstream/claude-code](https://github.com/contextstream/claude-code) | Smart Context: auto-injecting relevant memory via hooks, auto-learning from mistakes | contextstream |
| [memvid/claude-brain](https://github.com/memvid/claude-brain) | Memory statistics, lightweight portable design | memvid |
| [rlancemartin/claude-diary](https://github.com/rlancemartin/claude-diary) | /diary reflection entries, /reflect pattern analysis | rlancemartin (MIT License) |

Thank you to these developers for sharing their work and making the Claude Code community better.

## Requirements

- Claude Code (with hooks support)
- Node.js 18+
- Zero dependencies

## License

MIT License

---

Made by [HelloRuru](https://ohruru.com) -- someone who believes tools should be transparent, simple, and something you can actually understand.
