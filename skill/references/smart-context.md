# Smart Context Mapping

## CWD to Memory File Mapping

session-start.js detects which project you're working in based on CWD, then loads the relevant memory files.

### How to Configure

Edit the `PROJECT_CONTEXT` array in `session-start.js`:

```javascript
const PROJECT_CONTEXT = [
  {
    keywords: ['my-app'],        // CWD contains these keywords
    name: 'My App',              // Display name
    files: ['app-notes.md'],     // Memory files to load
  },
];
```

### Loading Logic

1. Get CWD path
2. Match keywords to find the project
3. Read matching memory files, output to stdout (injected into Claude context)
4. Also load the most recent session summary (if available)

### Notes

- Only the first 50 lines of each memory file are loaded (prevents context overflow)
- Missing memory files are silently skipped
- Multiple memory files are separated by dividers
