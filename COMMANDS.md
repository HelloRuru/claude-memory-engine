# Commands Reference

All slash commands included in the memory engine. Each command has both English and Chinese versions — they do the same thing.

> Type `/overview` or `/全覽` inside Claude Code to see this list.

## Memory Operations

### `/save` · `/存記憶`

Save something to memory so the next conversation knows about it. Checks for duplicates first — if the topic already exists in a memory file, it updates that section instead of creating a new one. Memory is stored in topic-specific files (`memory/*.md`), not dumped into one big file.

### `/reload` · `/讀取`

Load memory into the current conversation. SessionStart hooks inject a brief summary automatically, but `/reload` does a full read — loading actual file contents so Claude can reference specific details. You can also target a specific topic: `/reload blog` only loads blog-related memory.

### `/memory-search` · `/搜尋記憶`

Search across all memory files by keyword. Scans memory files, session diaries, learned skills, and session summaries. Case-insensitive, shows up to 20 results sorted by most recently modified.

---

## Backup & Sync

### `/backup` · `/備份`

Push memory files to your GitHub backup repo. The SessionEnd hook auto-commits locally after every conversation; this command handles the push to remote. Only pushes files that have actually changed.

### `/sync` · `/同步`

Two-way sync: push local changes to GitHub, then pull any remote changes back. Use this when working across multiple devices. If there are conflicts, it shows them and asks how to resolve.

### `/recover` · `/想起來`

Disaster recovery and cross-device sync. When local memory is lost, corrupted, or you're setting up a new computer — this pulls everything back from your GitHub backup. Always pushes first (to protect current state), then pulls. With a GitHub backup repo, this works across devices: memories from your laptop can be pulled to your desktop.

---

## Health Checks

### `/check` · `/健檢`

Quick daily health check. Scans memory file structure, checks MEMORY.md capacity (200-line system limit), finds orphan files and broken links, and reports environment status. Lists suggestions but doesn't auto-modify anything.

### `/full-check` · `/大健檢`

Comprehensive weekly audit. Everything in `/check` plus: command layer audit (overlapping commands, broken paths), cross-file duplicate detection, cross-reference integrity (MEMORY.md -> memory files -> skills -> references chain), environment config check (settings.json, hook scripts), and git repo status across all projects.

### `/memory-health` · `/記憶健檢`

Focused health check on memory files and hooks. Shows line counts, last-updated dates, and status for every memory file. Flags stale files (30+ days without update) and oversized files (200+ lines). Also checks hook script status via debug logs.

---

## Learning & Reflection

### `/learn` · `/學習`

Auto-learn from mistakes. Claude triggers this on its own when it hits a pitfall — wrong approach that eventually got fixed, non-obvious workaround, or something that took 3+ attempts. Saves the problem, solution, and "next time" trigger to `~/.claude/skills/learned/`. Stays quiet about it — just says "Learned: {title}" and keeps working.

### `/reflect` · `/反思`

The big review. Runs the Learning Loop's review steps: reads recent sessions, scans pitfall records, audits all memory files, marks each section as valid/outdated/duplicate, then suggests merges, updates, and cleanup. Uses a decision tree (serve the main goal? -> condense? -> already covered? -> only then delete). Generates a report with findings, a cleanup checklist for confirmation, and conclusions. Recommended weekly.

### `/diary` · `/回顧`

Write a reflection diary entry for the current conversation. Records what was done, what was learned, patterns noticed, and notes for next time. Saved to `~/.claude/sessions/diary/`. Kept concise — under 30 lines per entry.

---

## Workflow

### `/todo` · `/待辦`

Cross-project task tracker. Shows all incomplete tasks grouped by project, suggests what to work on next based on urgency. Can filter by project name.

### `/compact-guide` · `/壓縮建議`

Helps decide when to use `/compact`. Shows a decision table: compact after research/debug/deploy/task-switch, don't compact mid-coding or mid-debug. Auto-suggests when context usage exceeds 60%.

### `/overview` · `/全覽`

This page. Lists all available commands with descriptions.
