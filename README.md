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
  <img src="https://img.shields.io/badge/version-1.2-C4B7D7?style=flat-square" alt="v1.2">
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

## :sparkles: What's New in v1.2

| Feature | Description |
| :------ | :---------- |
| 14 commands (was 4) | Full command suite: daily ops, health checks, backup, learning, task tracking |
| Bilingual commands | Every command has both English and Chinese versions (28 files total) |
| `/check` + `/full-check` | Two-tier health check system -- quick daily scan and comprehensive weekly audit |
| `/save` `/reload` `/sync` | Natural-language shortcuts for memory operations (inspired by real daily workflow) |
| `/learn` | Explicit command for the auto-learn pitfall system |
| `/todo` | Cross-project task tracking |
| `/recover` | Disaster recovery when local memory is lost |
| `/compact-guide` | Smart guide for when to compress context |

<details>
<summary>v1.1 changes</summary>

| Feature | Description |
| :------ | :---------- |
| Auto-detect Smart Context | No more manual `PROJECT_CONTEXT` config -- automatically scans all project memory directories and matches by CWD |
| Chinese correction detection | `correctionKeywords` now includes 13 Chinese phrases |
| `/memory-search` command | Search across all memory files by keyword |
| Pitfall solutions | Auto Learn now extracts the fix from the conversation, not just the error |
| Improved session summaries | Summaries now include "What was done" topic extraction |
| Weekly digest | Sessions older than 7 days are auto-merged into weekly digests |

</details>

---

## :dart: What Makes This Different

**Standard features** -- what you'd expect from any memory tool:

- Smart Context: auto-load project-specific memory based on your working directory
- Auto Learn: detect pitfalls during sessions and save them as reusable skills
- Session summaries: save what was done, which files changed, key decisions

**Add-ons** -- what Memory Engine does beyond the basics:

| Feature | Description |
| :------ | :---------- |
| Memory organization | Hub-and-spoke: MEMORY.md index (200-line cap) + topic files that auto-slim |
| Health monitoring | Two-tier: `/check` for daily scan, `/full-check` for weekly audit -- both targetable by project |
| Cross-project tasks | `/todo` tracks pending items across all projects |
| Disaster recovery | `/recover` restores from GitHub backup when local files are lost |
| Context management | `/compact-guide` tells you when to compress and when not to |
| Bilingual commands | Every command in English + Traditional Chinese (28 files), each written natively |
| Backup & sync | `/backup` and `/sync` with GitHub, bidirectional |

> Not just a notepad -- a filing system with health checks, disaster recovery, and self-maintenance.

---

## The Solution

Memory Engine uses **5 hooks** and **14 commands** (each with English + Chinese versions) to fix all of this.

### :link: Hooks (Automatic)

| Hook | When It Runs | What It Does |
| :--- | :----------- | :----------- |
| `session-start` | Every new conversation | Loads last session's summary + project-specific memory based on your working directory |
| `session-end` | Every conversation end | Saves what you did, which files changed, and scans for pitfall patterns |
| `memory-sync` | Every message you send | Detects if memory files were updated by another session, shows what changed |
| `write-guard` | Before every file write | Warns when writing to `.env`, `credentials`, or other sensitive files |
| `pre-push-check` | Before every git push | Checks staged files for secrets, extra warning on force push |

### :speech_balloon: Commands

Every command has an English and Chinese version. Use whichever feels natural.

**Daily Operations** -- the basics you'll use every day

| EN | ZH | Function |
| :- | :- | :------- |
| `/save` | `/存記憶` | Save information across sessions -- dedup, route to the right file, never lose context |
| `/reload` | `/讀取` | Load memory files into the current conversation for full-detail access |
| `/todo` | `/待辦` | Cross-project task tracker -- list pending items, suggest next steps |
| `/backup` | `/備份` | Push local memory to GitHub backup repository |
| `/sync` | `/同步` | Bidirectional sync -- push local changes, pull remote updates |

> In plain English: "Remember this for next time" -> `/save`. "What was I working on?" -> `/reload`. "What's left to do?" -> `/todo`. Done for the day, don't want to lose anything -> `/backup`.

**Reflection & Learning** -- help Claude get better over time

| EN | ZH | Function |
| :- | :- | :------- |
| `/diary` | `/回顧` | Generate a reflection diary -- what was done, learned, and patterns noticed |
| `/reflect` | `/反思` | Analyze recent diaries and pitfall records, find recurring patterns |
| `/learn` | `/學習` | Save pitfall experiences -- wrong approaches tried, eventual solutions found |

> In plain English: Had a productive session? -> `/diary`. End of the week, want to spot recurring mistakes? -> `/reflect`. Just spent 30 minutes debugging something dumb? -> `/learn` (actually, Claude auto-detects big pitfalls and saves them without being asked).

**Health Checks** -- make sure the memory system is working

| EN | ZH | Function |
| :- | :- | :------- |
| `/check` | `/健檢` | Quick health check -- memory capacity, broken links, orphan files, environment status |
| `/full-check` | `/大健檢` | Comprehensive audit -- everything in `/check` plus commands, cross-references, git repos, environment config |
| `/memory-health` | `/記憶健檢` | Focused check on memory file line counts, update dates, and capacity warnings |

> In plain English: Claude seems off, giving weird answers? -> `/check`. Weekly one-minute full-body scan -> `/full-check`. Just want to know if memory is getting full -> `/memory-health`. All three accept a target, e.g. `/check blog` to only scan blog-related files.

**Search & Maintenance** -- find things + emergency recovery

| EN | ZH | Function |
| :- | :- | :------- |
| `/memory-search` | `/搜尋記憶` | Search across all memory files by keyword |
| `/recover` | `/想起來` | Disaster recovery -- restore memory from GitHub backup when local files are lost |
| `/compact-guide` | `/壓縮建議` | Smart guide for when to use `/compact` and when not to |

> In plain English: "I saved something about this before, where is it?" -> `/memory-search`. New computer or lost your memory files -> `/recover` (requires a GitHub backup repo set up beforehand). Conversation getting slow and long -> `/compact-guide`.

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

**Step 4** -- (Recommended) Create a private GitHub repo for memory backup:

```bash
# Create a private repo (e.g., "claude-memory")
gh repo create claude-memory --private

# Clone it locally
git clone https://github.com/YOUR_USERNAME/claude-memory.git ~/.claude/claude-memory
```

This enables `/backup`, `/sync`, and `/recover` commands. Without a backup repo, your memory only lives locally -- if your machine dies, your memory dies with it.

**Step 5** -- Restart Claude Code. Done!

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
    session-start.js        # New session -> load recall + smart-context
    session-end.js          # Session end -> save summary + detect pitfalls
    memory-sync.js          # Every message -> cross-session memory sync
    write-guard.js          # Before file write -> sensitive file warning
    pre-push-check.js       # Before git push -> safety check
  commands/
    # Daily Operations
    save.md / 存記憶.md      # Save memory across sessions
    reload.md / 讀取.md      # Load memory into context
    todo.md / 待辦.md        # Cross-project task tracker
    backup.md / 備份.md      # Push memory to GitHub
    sync.md / 同步.md        # Bidirectional sync
    # Reflection & Learning
    diary.md / 回顧.md       # Reflection diary
    reflect.md / 反思.md     # Pattern analysis
    learn.md / 學習.md       # Auto-learn from mistakes
    # Health Checks
    check.md / 健檢.md       # Quick health check
    full-check.md / 大健檢.md # Comprehensive audit
    memory-health.md / 記憶健檢.md  # Memory capacity check
    # Search & Recovery
    memory-search.md / 搜尋記憶.md  # Keyword search
    recover.md / 想起來.md    # Disaster recovery
    compact-guide.md / 壓縮建議.md  # Context compression guide
  skill/
    SKILL.md                # Skill definition
    references/
      smart-context.md      # CWD to memory file mapping
      auto-learn.md         # Pitfall detection rules
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
