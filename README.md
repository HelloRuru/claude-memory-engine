<h1 align="center">Claude Memory Engine</h1>

<p align="center">
  <strong>Not just memory — it learns.</strong><br>
  Learn from mistakes. Learn to improve.<br>
  AI can be a student too, growing through every cycle.
</p>

<p align="center">
  Built with hooks and markdown. No database. No external API.<br>
  Just scripts and files. Nothing hiding.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-D4A5A5?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/node-18%2B-B8A9C9?style=flat-square" alt="Node 18+">
  <img src="https://img.shields.io/badge/dependencies-zero-A8B5A0?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/claude_code-hooks-E8B4B8?style=flat-square" alt="Claude Code Hooks">
  <img src="https://img.shields.io/badge/version-1.3-C4B7D7?style=flat-square" alt="v1.3">
</p>

<p align="center">
  <b>English</b> &nbsp;|&nbsp; <a href="README.zh-TW.md">繁體中文</a> &nbsp;|&nbsp; <a href="README.ja.md">日本語</a>
</p>

---

## WHAT — Every new conversation, Claude starts from zero

- That bug you spent 30 minutes on last session — it hits the same wall again
- Your preferences, your project rules — gone the moment a new session starts
- Switch from Project A to Project B — it can't tell which is which
- Long conversations get fuzzy — important decisions vanish after compression
- Memory files pile up — no one organizes them, they just keep growing
- Your computer dies — local memory gone, no backup

Memory tools can help it "remember." But remembering is not the same as learning.

---

## WHY — Because it learns

Memory Engine doesn't just help Claude remember — it teaches Claude to learn like a student:

- Mistakes don't repeat — it saves both the problem and the fix
- Switching projects doesn't mean starting over — it knows what you're working on
- It gets better over time — each cycle, it understands you a little more
- You can see how it learns — everything is markdown and JS, no black box

---

## HOW — Through the Student Loop

- **Student Loop** — 8-step learning cycle, like cramming for finals but it keeps getting better
- **Smart Context** — auto-loads the right project's memory based on your working directory
- **Auto Learn** — saves both the problem and the fix when it hits a wall, won't repeat the same mistake

### :brain: The Student Loop

> Think of it like exam prep. I'm trying to make Claude Code act like a student cramming for finals — take notes after every class, organize them, review for patterns, build an error notebook, and do a big end-of-term review. Each cycle, it gets a little better.

**In class (automatic, runs every session)**

At the end of every conversation, Claude automatically does three things:

1. **Takes notes** — records what was done, which files changed, key decisions made
2. **Links them** — tags the project, connects to previous notes
3. **Spots patterns** — scans the conversation for pitfall signals (retrying the same thing 5+ times, errors followed by fixes, user corrections, back-and-forth edits)

Every 20 messages, it also saves a mid-session checkpoint — so nothing important gets lost when long conversations are compressed.

**Final exam review (manual, run `/reflect`)**

After a few days of notes, run `/reflect` and Claude will:

4. **Review** — read the past 7 days of notes and pitfall records, mark what's still useful and what's outdated
5. **Refine** — apply four decision questions: Keep it? -> Condense it? -> Already covered by a rule? -> Delete only as last resort
6. **Re-study** — re-analyze the cleaned-up data to find patterns that were buried in noise
7. **Slim down** — list items that can be removed, wait for your confirmation before deleting anything
8. **Wrap up** — produce a report: what was learned, what changed, what to watch for next cycle

> This isn't a one-time thing. Each cycle makes the notes sharper, the patterns clearer, the mistakes fewer. It's a loop that keeps improving.

### :detective: Smart Context + Auto Learn

**Smart Context** — whatever folder you're working in, it loads that project's memory. No config, no manual switching.

**Auto Learn** — hit a wall during a session and figured it out? It saves both the problem and the fix, then reminds itself next time. If the same kind of mistake shows up 3+ times across different days, it suggests writing it into permanent rules.

### :link: Day-to-day tools

Memory and learning are the core, but day-to-day work needs more:

| Feature | Description |
| :--- | :--- |
| Health | `/check` daily scan + `/full-check` weekly audit to keep the memory system healthy |
| Tasks | `/todo` tracks pending items across all projects |
| Backup | `/backup` `/sync` connect to GitHub — bidirectional sync, safe even if your machine dies |
| Recovery | `/recover` restores lost memory from GitHub backup |
| Search | `/memory-search` keyword search across all memory files |
| Bilingual | Every command has an English + Traditional Chinese version (28 files) |

<details>
<summary><strong>Full command list</strong></summary>

**Daily Operations**

| EN | ZH | Function |
| :--- | :- | :--- |
| `/save` | `/存記憶` | Save memory across sessions — auto-dedup and route to the right file |
| `/reload` | `/讀取` | Load memory into the current conversation |
| `/todo` | `/待辦` | Cross-project task tracking |
| `/backup` | `/備份` | Push local memory to GitHub |
| `/sync` | `/同步` | Bidirectional sync — push local, pull remote |

**Reflection & Learning**

| EN | ZH | Function |
| :--- | :- | :--- |
| `/diary` | `/回顧` | Generate a reflection diary |
| `/reflect` | `/反思` | Analyze pitfall records and find recurring patterns |
| `/learn` | `/學習` | Manually save a pitfall experience |

**Health Checks**

| EN | ZH | Function |
| :--- | :- | :--- |
| `/check` | `/健檢` | Quick scan — capacity, broken links, orphan files |
| `/full-check` | `/大健檢` | Full audit — commands, git repos, environment config |
| `/memory-health` | `/記憶健檢` | Memory file line counts, update dates, capacity warnings |

**Search & Maintenance**

| EN | ZH | Function |
| :--- | :- | :--- |
| `/memory-search` | `/搜尋記憶` | Keyword search across all memory files |
| `/recover` | `/想起來` | Restore memory from GitHub backup |
| `/compact-guide` | `/壓縮建議` | Guide for when to compress and when not to |

</details>

<details>
<summary><strong>7 Hooks (all automatic)</strong></summary>

| Hook | Trigger | What it does |
| :--- | :------ | :----------- |
| `session-start` | New conversation | Load last summary + project memory |
| `session-end` | Conversation ends | Save summary + pitfall detection |
| `memory-sync` | Every message sent | Detect cross-session memory changes |
| `write-guard` | Before file writes | Sensitive file interception |
| `pre-push-check` | Before git push | Safety check |
| `mid-session-checkpoint` | Every 20 messages | Save checkpoint + mini analysis |

</details>

---

## :package: Installation

**Step 1** — Create a GitHub repo for memory backup:

> Without a backup repo, `/backup`, `/sync`, and `/recover` won't work. Memory only lives locally — if your machine dies, it's all gone.

```bash
gh repo create claude-memory --private
git clone https://github.com/YOUR_USERNAME/claude-memory.git ~/.claude/claude-memory
```

**Step 2** — Copy files:

```bash
cp hooks/*.js ~/.claude/scripts/hooks/
cp commands/*.md ~/.claude/commands/
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**Step 3** — Create directories:

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**Step 4** — Add hooks config to `~/.claude/settings.json`:

<details>
<summary><strong>Click to expand full config</strong></summary>

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
          },
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/mid-session-checkpoint.js"
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

**Step 5** — Restart Claude Code. Done!

---

## :wrench: Customization

| What | Where |
| :--- | :---- |
| Context map | Smart Context v1.1 auto-detects (usually no config needed). Override in `session-start.js` |
| Keywords | `correctionKeywords` in `session-end.js` |
| Sensitive files | `PROTECTED_PATTERNS` in `write-guard.js` |
| Retention | `MAX_SESSIONS` in `session-end.js` (default: 30) |

---

## :bulb: Design Philosophy

**Why not a database?**
Markdown files are human-readable, editable, and git-committable. Claude Code already reads `.md` natively — why add complexity?

**Why not a Plugin?**
Plugins are black boxes. Hooks + Commands are transparent — every `.js` file is right there to inspect, modify, or delete. Tools should be something you control, not something that controls you.

---

## :pray: Credits

> **All code was written from scratch. No code was copied, forked, or adapted from any source project.**

| Project | What it inspired |
| :--- | :--- |
| [contextstream/claude-code](https://github.com/contextstream/claude-code) | Smart Context, auto-learning from mistakes |
| [memvid/claude-brain](https://github.com/memvid/claude-brain) | Memory statistics, lightweight design |
| [rlancemartin/claude-diary](https://github.com/rlancemartin/claude-diary) | Reflection diary, pattern analysis |

---

<details>
<summary><strong>Changelog</strong></summary>

**v1.3 — The Student Loop**
- 8-step learning cycle (first 3 automatic, last 5 via `/reflect`)
- Mid-session checkpoints (every 20 messages)
- `/reflect` 4-question decision tree
- SessionEnd fixes (transcript parsing, IDE noise filtering, pitfall threshold raised to 5)

**v1.2 — Full Command Suite**
- 14 bilingual commands (daily ops / reflection / health checks / search & recovery)
- Two-tier health checks (`/check` + `/full-check`)
- Cross-project tasks, backup sync, disaster recovery, compression guide

**v1.1 — Smart Context Auto-detect**
- No manual config needed — auto-scans project memory directories
- Chinese correction detection (13 Chinese keywords)
- Pitfall records include solutions, session summaries revamped, weekly auto-digest

</details>

<details>
<summary><strong>File structure</strong></summary>

```
claude-memory-engine/
  hooks/
    session-start.js          # New session -> load recall + smart-context
    session-end.js            # Session end -> save summary + pitfall detection
    memory-sync.js            # Every message -> cross-session memory sync
    write-guard.js            # Before file write -> sensitive file warning
    pre-push-check.js         # Before git push -> safety check
    mid-session-checkpoint.js # Every 20 messages -> checkpoint
  commands/
    save.md / 存記憶.md        # Save memory across sessions
    reload.md / 讀取.md        # Load memory
    todo.md / 待辦.md          # Cross-project tasks
    backup.md / 備份.md        # Push to GitHub
    sync.md / 同步.md          # Bidirectional sync
    diary.md / 回顧.md         # Reflection diary
    reflect.md / 反思.md       # Pattern analysis
    learn.md / 學習.md         # Pitfall learning
    check.md / 健檢.md         # Quick health check
    full-check.md / 大健檢.md   # Full audit
    memory-health.md / 記憶健檢.md
    memory-search.md / 搜尋記憶.md
    recover.md / 想起來.md
    compact-guide.md / 壓縮建議.md
  skill/
    SKILL.md
    references/
      smart-context.md
      auto-learn.md
```

</details>

---

## Requirements

- Claude Code (with hooks support)
- Node.js 18+
- Zero dependencies

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made by <a href="https://ohruru.com">HelloRuru</a>
</p>
