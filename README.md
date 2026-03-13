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
  <img src="https://img.shields.io/badge/version-1.5.1-C4B7D7?style=flat-square" alt="v1.5.1">
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

There is no real "end" to a Claude Code conversation — it might close, idle out, or get compressed. So Memory Engine doesn't rely on any single moment. Instead, it saves at three different points:

1. **Every 20 messages** (`mid-session-checkpoint`) — saves a checkpoint + mini analysis. The most reliable save point, because it counts messages itself
2. **Before context compression** (`pre-compact`) — fires right before context is compressed. Saves a snapshot, detects pitfalls, runs backup. This is when context is fullest, so pitfall detection is most accurate here
3. **When the conversation ends** (`session-end`) — saves a final summary + backup. Nice to have, but not guaranteed to fire (window might just close)

You don't need to remember to run any command before closing — your important stuff is already saved before you close.

On top of that, Claude also:
- **Takes notes** — records what was done, which files changed, key decisions made
- **Links them** — tags the project, connects to previous notes
- **Spots patterns** — scans for pitfall signals (retrying 5+ times, errors followed by fixes, user corrections)

**Final exam review (manual, run `/reflect`)**

After a few days of notes, run `/reflect` and Claude will:

4. **Review** — read the past 7 days of notes and pitfall records, mark what's still useful and what's outdated
5. **Refine** — apply four decision questions: Keep it? -> Condense it? -> Already covered by a rule? -> Delete only as last resort
6. **Re-study** — re-analyze the cleaned-up data to find patterns that were buried in noise
7. **Slim down** — list items that can be removed, wait for your confirmation before deleting anything
8. **Wrap up** — produce a report: what was learned, what changed, what to watch for next cycle

> This isn't a one-time thing. Each cycle makes the notes sharper, the patterns clearer, the mistakes fewer. It's a loop that keeps improving.

### :pencil2: Correction Cycle

Some mistakes don't show up in error logs. You correct its output, and only then does it realize — "oh, that was wrong." These mistakes don't get remembered automatically. Unless someone builds it an error notebook.

**Record** (`/analyze`, manual — run right after you correct something)

- You fix its work, type `/analyze`
- It compares both versions against existing rules
- Known rules it missed → logged, counted
- Patterns not in the rules yet → distilled into new ones
- The sooner you run it, the fresher the context

**Review** (automatic: before each task / manual: type `/correct` anytime)

- Before starting work, it scans the error notebook automatically
- Not re-learning — just a reminder: "I got this wrong last time, don't repeat it"
- Want to review on your own? Type `/correct` — no need to wait for a task or a cycle

**Clean up** (`/reflect` step 6, manual)

- Periodically scan the full notebook
- Same mistake 3+ times → upgrade to a hard rule
- Already internalized → mark cleared, free up space

But you know that from here on, your AI has grown a little more.

<details>
<summary><strong>FAQ</strong></summary>

**Can I just type `/correct` directly?**
Yes. `/correct` works anytime — no need to wait for a task or a cycle. It simply opens the error notebook and shows you what's active.

**How often should I run `/reflect`?**
There's no fixed schedule. A good rhythm is once a week, or whenever the notebook feels cluttered. Step 6 of `/reflect` handles cleanup — upgrading repeat offenders to hard rules and clearing ones you've already internalized.

**Do I have to run `/analyze` first before `/correct` works?**
No. `/analyze` records new mistakes; `/correct` reviews existing ones. They're independent. Even if you never run `/analyze`, `/correct` still shows whatever is already in the notebook.

</details>

### :detective: Smart Context + Auto Learn

**Smart Context** (automatic, no config needed)

- Whatever folder you're working in, it loads that project's memory
- Switch projects and it switches automatically

**Auto Learn** (automatic, on session end)

- Hit a wall and figured it out? It saves both the problem and the fix
- Reminds itself next time a new conversation starts
- Same kind of mistake 3+ times across different days → suggests writing it into permanent rules

### :link: Day-to-day tools

Memory and learning are the core, but day-to-day work needs more:

| Feature | Description |
| :--- | :--- |
| Health | `/check` daily scan + `/full-check` weekly audit to keep the memory system healthy |
| Tasks | `/todo` tracks pending items across all projects |
| Backup | `/backup` `/sync` connect to GitHub — bidirectional sync, safe even if your machine dies |
| Cross-device | Set up a GitHub memory repo, and your memory works across machines. New device? Run `/recover` and it's all there |
| Recovery | `/recover` restores lost memory from GitHub backup |
| Search | `/memory-search` keyword search across all memory files |
| Bilingual | Every command has an English + Traditional Chinese version (36 files) |

<details>
<summary><strong>Full command list</strong></summary>

> **Not sure what commands are available?** Type `/overview` (`/全覽`) to see them all.

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
| `/overview` | `/全覽` | List all available commands |

**Collaboration**

You have three Claude Code windows open. One's fixing a bug, one's writing docs, one's cleaning up code. You switch over — and that window has zero clue what you were just doing.

`/save` is for things you want to remember long-term. `/backup` pushes everything to GitHub. `/handoff` is for right now — what you were working on, what's done, what's not.

| EN | ZH | Function |
| :--- | :- | :--- |
| `/handoff` | `/交接` | Generate a handoff file so another session can pick up where you left off |

**How it works:** Run `/handoff` in window A. It saves a handoff file with your progress, decisions, and unfinished tasks. Window B picks it up automatically — no command needed on the receiving end. If B is already mid-conversation, it detects the new handoff in real time. If B starts a new conversation, it loads the handoff on startup. Either way, B sees it once and moves on.

</details>

<details>
<summary><strong>8 Hooks (all automatic)</strong></summary>

| Hook | Trigger | What it does |
| :--- | :------ | :----------- |
| `session-start` | New conversation | Load last summary + project memory + pending handoffs |
| `session-end` | Conversation ends | Save summary + backup (best-effort, may not fire) |
| `pre-compact` | Context compression (auto or manual) | Save snapshot + pitfall detection + backup — the real safety net |
| `memory-sync` | Every message sent | Detect cross-session memory changes + new handoffs |
| `write-guard` | Before file writes | Sensitive file interception |
| `pre-push-check` | Before git push | Safety check |
| `mid-session-checkpoint` | Every 20 messages | Save checkpoint + mini analysis |

</details>

---

## :arrows_counterclockwise: Cross-device Sync

Memory Engine supports cross-device sync through a GitHub repo. Set it up once, and your memory works on every machine.

**How it works:**

1. `/backup` pushes local memory to your private GitHub repo
2. `/sync` does bidirectional sync — push local changes, pull remote updates
3. `/recover` on a new device pulls everything back — all your memory, pitfall records, project history

**What this means:** Switch laptops, reinstall your OS, set up a new workstation — run `/recover` and Claude picks up right where you left off. No re-explaining your preferences, no lost context.

> The GitHub repo is private by default. Your memory never touches any external service beyond your own GitHub account.

---

## :package: Installation

**Step 1** — Create a GitHub repo for memory backup (cross-device sync):

> Without a backup repo, `/backup`, `/sync`, and `/recover` won't work. Memory only lives locally — if your machine dies, it's all gone. With a repo, your memory works across devices.

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
    "PreCompact": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/pre-compact.js"
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

## :rocket: Quick Start

Done installing? Here's what to do next.

1. **Just start working** — open Claude Code and go. `session-start` loads your last session's context automatically
2. **Just close when done** — `session-end` saves a summary if it fires; `mid-session-checkpoint` and `pre-compact` already have your back
3. **Want to remember something?** — `/save` stores it in long-term memory
4. **Switching windows?** — `/handoff` passes your progress to the next window
5. **After a few days** — `/reflect` reviews your notes, finds patterns, cleans up

That's it. Everything else runs in the background.

---

## :zap: Token Impact

Memory Engine adds almost no token overhead to your daily usage.

| Hook | When it runs | Token cost |
| :--- | :----------- | :--------- |
| `session-start` | Once per conversation | ~200–500 tokens (loads last summary + project memory) |
| `memory-sync` | Every message | **0** unless another session changed memory files |
| `mid-session-checkpoint` | Every message | **0** unless it's the 20th message |
| `write-guard` | Before file writes | **0** unless writing a sensitive file |
| `pre-push-check` | Before git push | **0** unless pushing |
| `session-end` / `pre-compact` | End of conversation / compression | Output not injected into context |

**SKILL.md** (136 lines) is a learned skill — Claude Code only loads it when relevant, not every conversation.

**Bottom line:** ~200–500 extra tokens at the start of each conversation. Everything else is zero unless triggered.

---

## :wrench: Customization

| What | Where |
| :--- | :---- |
| Context map | Smart Context auto-resolves per-project memory directory (no config needed). Override in `session-start.js` |
| Keywords | `correctionKeywords` in `shared-utils.js` |
| Sensitive files | `PROTECTED_PATTERNS` in `write-guard.js` |
| Retention | `MAX_SESSIONS` in `session-end.js` (default: 30) |

---

## :bulb: Design Philosophy

**Why not a database?**
- Markdown — you can open it, read it, edit it, git commit it
- Claude Code already reads `.md` natively — why add complexity?

**Why not a Plugin?**
- Plugins are black boxes
- Hooks + Commands are transparent — every `.js` file is right there to inspect
- Don't like something? Change it. Think it's unnecessary? Delete it
- Tools should be something you control, not something that controls you

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

**v1.5.1 — Quick Reference**
- Added `/overview` (`/全覽`) to command tables and SKILL.md
- 36 bilingual command files (18 pairs EN + ZH)

**v1.5 — Session Handoff + Shared Core**
- Session Handoff — switch between Claude Code windows without losing context. `/handoff` saves a handoff file, the next session picks it up automatically
- Correction Cycle — `/analyze` compares your edits against rules, logs mistakes, builds an error notebook that auto-reviews before each task
- `shared-utils.js` — extracted shared functions from `session-end.js` and `pre-compact.js`, eliminating ~80% duplicated code
- Smart Context now resolves the correct memory directory per-project automatically — no hardcoded paths
- Backup scope expanded: hooks, engine skill, and all project memories included in `/backup` and `/sync`
- 36 bilingual command files (EN + ZH), up from 28

**v1.4 — The Real Safety Net**
- PreCompact hook — saves snapshot before context compression (auto or manual)
- Cross-device sync — GitHub memory repo works across machines, `/recover` on new device pulls everything back
- Fires one step before compression — always has a save point, no matter how the conversation ends

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
    session-start.js          # New session -> load recall + smart-context + handoff
    session-end.js            # Session end -> save summary + backup (best-effort)
    pre-compact.js            # Context compression -> snapshot + pitfall detection + backup
    shared-utils.js           # Shared functions (transcript, pitfall, backup)
    memory-sync.js            # Every message -> cross-session memory sync + handoff
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
    handoff.md / 交接.md        # Session handoff
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
