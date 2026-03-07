<h1 align="center">Claude Memory Engine</h1>

<p align="center">
  <strong>A memory system for Claude Code, built with hooks and markdown.</strong><br>
  No database. No external API. No mysterious binary files.<br>
  Just <code>.js</code> and <code>.md</code> you can actually read.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-D4A5A5?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/node-18%2B-B8A9C9?style=flat-square" alt="Node 18+">
  <img src="https://img.shields.io/badge/dependencies-zero-A8B5A0?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/claude_code-hooks-E8B4B8?style=flat-square" alt="Claude Code Hooks">
  <img src="https://img.shields.io/badge/version-1.1-C4B7D7?style=flat-square" alt="v1.1">
</p>

<p align="center">
  <b>English</b> &nbsp;|&nbsp; <a href="README.zh-TW.md">繁體中文</a> &nbsp;|&nbsp; <a href="README.ja.md">日本語</a>
</p>

---

## The Problem

Every new conversation, Claude forgets everything.

- You spent 30 minutes debugging something last session -- this session it makes the exact same mistake
- You told it to "remember" something -- next session it's gone
- You're working on Project A, switch to Project B -- it still thinks you're talking about A
- Long sessions get compressed -- important decisions disappear

---

## :sparkles: What's New in v1.1

| Feature | Description |
| :------ | :---------- |
| Auto-detect Smart Context | No more manual `PROJECT_CONTEXT` config -- automatically scans all project memory directories and matches by CWD |
| Chinese correction detection | `correctionKeywords` now includes 13 Chinese phrases ("不對", "錯了", "改回來", etc.) |
| `/memory-search` command | Search across all memory files by keyword |
| Pitfall solutions | Auto Learn now extracts the fix from the conversation, not just the error |
| Improved session summaries | Summaries now include "What was done" topic extraction, not just raw message lists |
| Weekly digest | Sessions older than 7 days are auto-merged into weekly digests at `sessions/digest/` |

---

## The Solution

Memory Engine uses **5 hooks** and **4 commands** to fix all of this.

### :link: Hooks

| Hook | When It Runs | What It Does |
| :--- | :----------- | :----------- |
| `session-start` | Every new conversation | Loads last session's summary + project-specific memory based on your working directory |
| `session-end` | Every conversation end | Saves what you did, which files changed, and scans for pitfall patterns |
| `memory-sync` | Every message you send | Detects if memory files were updated by another session, shows what changed |
| `write-guard` | Before every file write | Warns when writing to `.env`, `credentials`, or other sensitive files |
| `pre-push-check` | Before every git push | Checks staged files for secrets, extra warning on force push |

### :speech_balloon: Commands

| Command | Function |
| :------ | :------- |
| `/diary` | Generate a reflection diary -- what was done, learned, and patterns noticed |
| `/reflect` | Analyze recent diaries and pitfall records, find recurring patterns |
| `/memory-health` | List all memory files with line counts, last updated dates, and health status |
| `/memory-search` | Search across all memory files by keyword |

---

## :package: Installation

**Step 1** -- Copy files to their locations:

```bash
# Hook scripts
cp hooks/*.js ~/.claude/scripts/hooks/

# Commands
cp commands/*.md ~/.claude/commands/

# Skill definition (optional -- Claude will auto-recognize this Skill)
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**Step 2** -- Create required directories:

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**Step 3** -- Add hooks config to `~/.claude/settings.json`:

<details>
<summary><strong>Click to expand full hooks config</strong></summary>

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

</details>

**Step 4** -- Restart Claude Code. Done!

---

## :brain: Smart Context

`session-start.js` automatically scans all project directories under `~/.claude/projects/` and matches them against your current working directory.

No manual configuration needed -- it detects which project you're in and loads the corresponding memory files automatically.

Memory files live in `~/.claude/projects/{project-id}/memory/`.

---

## :detective: Auto Learn

`session-end.js` automatically scans each conversation for four "pitfall" patterns:

| Signal | How It's Detected | Example |
| :----- | :---------------- | :------ |
| 3+ retries | Same tool called 3+ times on same file | Edit the same file 4 times |
| Error then fix | Error appears, then same area succeeds | Build fails -> fix code -> build passes |
| User correction | User says "wrong", "revert" (EN) or "不對", "錯了", "改回來" (ZH) | "That's not the right file" |
| Back-and-forth | Same file edited repeatedly in quick succession | Changed CSS then changed it back |

Detected pitfalls are saved to `~/.claude/skills/learned/auto-pitfall-{date}.md` and reviewed at the start of the next session.

In v1.1, pitfall records also include the **solution** -- the successful fix extracted from the same conversation, so you get both the problem and the answer.

---

## :open_file_folder: File Structure

```
claude-memory-engine/
  hooks/
    session-start.js      # New session -> load recall + smart-context
    session-end.js        # Session end -> save summary + detect pitfalls
    memory-sync.js        # Every message -> cross-session memory sync
    write-guard.js        # Before file write -> sensitive file warning
    pre-push-check.js     # Before git push -> safety check
  commands/
    diary.md              # /diary reflection diary
    reflect.md            # /reflect reflection analysis
    memory-health.md      # /memory-health memory health check
    memory-search.md      # /memory-search keyword search across memory
  skill/
    SKILL.md              # Skill definition
    references/
      smart-context.md    # CWD to memory file mapping
      auto-learn.md       # Pitfall detection rules
```

---

## :wrench: Customization

This Skill is designed to be modified. Common adjustments:

| What to Change | Where |
| :------------- | :---- |
| Smart Context mapping | Auto-detected in v1.1 (no config needed). Override with `autoDetectProjectContext()` in `session-start.js` |
| Pitfall detection keywords | `correctionKeywords` in `session-end.js` |
| Sensitive file patterns | `PROTECTED_PATTERNS` in `write-guard.js` |
| Session retention count | `MAX_SESSIONS` in `session-end.js` (default: 30) |

---

## :bulb: Design Philosophy

**Why not a database?**
Markdown files are human-readable, editable, and git-committable. No extra packages, no server, no query language. Claude Code already reads `.md` natively -- why add complexity?

**Why not a Plugin?**
Plugins are black boxes -- you can't see what they changed, stored, or read. Hooks + Commands are transparent -- every `.js` file is right there to inspect, modify, or delete. Tools should be something you control, not something that controls you.

---

## :pray: Inspiration & Credits

This Skill's concepts were inspired by three open-source projects. To be clear:

> **All code was written from scratch. No code was copied, forked, or adapted from any of the projects below.**
>
> I studied what each tool does best, then fused those *concepts* into a new implementation. Like reading menus from three restaurants, then going home and cooking something new with my own ingredients and my own recipe.

| Project | Concept Inspired | Link |
| :------ | :--------------- | :--- |
| contextstream/claude-code | Smart Context: auto-injecting relevant memory via hooks, auto-learning from mistakes | [GitHub](https://github.com/contextstream/claude-code) |
| memvid/claude-brain | Memory statistics, lightweight portable design | [GitHub](https://github.com/memvid/claude-brain) |
| rlancemartin/claude-diary | /diary reflection entries, /reflect pattern analysis | [GitHub](https://github.com/rlancemartin/claude-diary) |

Thank you to these developers for sharing their work and making the Claude Code community better.

---

## Requirements

- Claude Code (with hooks support)
- Node.js 18+
- Zero dependencies

## License

MIT -- see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made by <a href="https://ohruru.com">HelloRuru</a> -- someone who believes tools should be transparent, simple, and something you can actually understand.
</p>
