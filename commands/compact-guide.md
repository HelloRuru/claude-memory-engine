# /compact-guide -- Smart Context Compression Guide

Help decide when to use `/compact` based on the current conversation state.

## When to Compact

| Situation | Compact? | Why |
| :-------- | :------- | :-- |
| Research/exploration done, ready to build | Yes | Research context is large; the plan is what matters |
| Planning done, starting to code | Yes | Plan is already in TodoWrite or a file |
| Debug session finished | Yes | Debug logs pollute the next task's context |
| Switching to a completely different task | Yes | Clear irrelevant context |
| Deployment done, starting new feature | Yes | Deployment logs aren't needed anymore |

## When NOT to Compact

| Situation | Why |
| :-------- | :-- |
| In the middle of writing code | Lose variable names, file paths, partial state |
| Debugging an unresolved issue | Lose error messages and attempted solutions |
| Multi-file refactor in progress | Forget which files still need changes |
| Just read an important doc, about to reference it | Doc content gets summarized away |

## Auto-Suggest

When context usage exceeds 60%, proactively suggest whether compacting is appropriate based on the current task state.
