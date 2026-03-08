# /todo -- Cross-Project Task Tracker

Show pending tasks across all projects and suggest what to work on next.

## Steps

1. **Read task file** -- Load `memory/todo-status.md` (or your configured task tracking file)
2. **List all incomplete items** -- Group by project, show status
3. **Suggest next step** -- Prioritize by urgency
4. **Filter by project** -- If the user specifies a project name, only show that project's tasks

## Output Format

```
Pending Tasks

[Project A]
- [ ] Task description (added {date})
- [ ] Task description (added {date})

[Project B]
- [ ] Task description (added {date})

Suggested next: {most urgent task} because {reason}
```

## Notes

- Keep the output scannable -- no walls of text
- If no tasks exist, say so and ask if the user wants to add some
- Tasks can be added, completed, or removed by editing the task file directly
