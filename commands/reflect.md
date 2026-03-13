# /reflect — Learning Loop Steps 4-8 (Review -> Organize -> Refine -> Re-learn -> Trim -> Wrap up)

After the user triggers this command, run Learning Loop steps 4-8.
Two phases: first half (review + organize) completes, then automatically continues to second half (re-analyze + trim + wrap up).

## First Half: Review + Organize (Steps 4-5)

### Step 4: Review (read-only, don't change anything yet)

1. **Read project index**: Read `~/.claude/sessions/project-index.md`
   - If the user specifies a project (e.g., `/reflect blog`) → only look at that project's sessions
   - No project specified → look at all projects
2. **Read session summaries**: Based on the index, read the last 7 days of session records (max 10)
3. **Read pitfall records**: Scan `~/.claude/skills/learned/auto-pitfall-*.md`
4. **Read memory files**: Scan all `memory/*.md` files
5. **Tag each item** (read-only, don't edit yet):
   - Each memory paragraph: `active` / `outdated` / `duplicate` / `needs update`
   - Each pitfall record: `internalized` (already in CLAUDE.md) / `still relevant` / `can remove`

### Step 5: Refine (act on tags, use the 4-question decision tree)

Run each item through four questions before acting — don't merge mechanically:
- **Q1 Still needed?** Does this item serve the core workflow? → If not, mark for removal
- **Q2 Can condense?** Can it merge with another item into a tighter version? → Write the refined version, it naturally replaces the originals
- **Q3 Already covered?** Is this already covered by a CLAUDE.md rule? → If yes, don't duplicate it in memory
- **Q4 Remove as last resort** → Only if Q1-Q3 don't apply. Rarely needed

6. **Merge duplicates**: Find duplicate paragraphs in memory/*.md, condense using Q2
7. **Update outdated**: Items tagged "outdated" — use Q1 to decide if they still serve the core workflow
8. **Relocate**: Move misplaced content to the correct HOOK file

## Second Half: Re-analyze + Trim + Wrap up (Steps 6-8)

Runs automatically after first half completes. No need for the user to trigger again.

### Step 6: Re-learn from refined data

9. **Analyze patterns** (using the cleaned-up data):
   - What types of work does the user do most?
   - Which pitfalls keep recurring? Should any be added to CLAUDE.md?
   - Any new preferences or work habits?
   - Any HOOK trigger words that need updating?
10. **Compare**: This analysis vs. the last /reflect conclusion (if one exists)

### Step 7: Trim (mark for removal, don't delete directly)

11. **List removal candidates**:
    - Internalized pitfall records
    - Duplicate paragraphs left over after merging
    - Memories not updated in 30+ days and tagged "outdated"
12. **Show the list to the user for review**
13. **After user confirms, mark as "pending removal"** — actual deletion happens next /reflect

### Step 8: Wrap up (conclusion)

14. **Report**:
    - What was learned this cycle
    - What was changed (merged/updated/relocated)
    - What to watch for next cycle
    - Suggested CLAUDE.md / MEMORY.md updates (listed but not auto-applied)
15. **Save conclusion**: Save to `~/.claude/sessions/reflect-{date}.md`

## Output format

```
=== Learning Loop Reflection Report ({date}) ===

--- First Half: Review + Organize ---

Project stats:
- X sessions in the last 7 days, most active: {project name}
- Most used tools: {list}

Memory health:
- Active: X items / Outdated: X / Duplicate: X
- Actions: merged X, updated X, relocated X

Pitfall stats:
- Internalized: X / Still relevant: X / Can remove: X

--- Second Half: Re-learn + Trim + Wrap up ---

Patterns found:
1. {pattern} -> Suggestion: {action}

Removal candidates (pending user confirmation):
- [ ] {item 1}
- [ ] {item 2}

Conclusion:
- Learned: {summary}
- Changed: {summary}
- Next cycle watch: {summary}

Suggested updates:
- [ ] CLAUDE.md: add {new rule}
- [ ] MEMORY.md: update {which HOOK}
```

## Notes

- Step 5 "Refine" only edits memory/*.md, never touches CLAUDE.md
- CLAUDE.md changes are always suggestions only — user confirms before applying
- Removal is delayed by one cycle: mark this time, actually delete next time
- Items marked "pending removal" last /reflect → confirm and delete this time
- Report in plain language the user can understand at a glance
