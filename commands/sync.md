# /sync -- Sync Memory to Remote

Push local memory changes to your remote backup, or pull the latest from remote.

## Push (default)

1. Run the backup script: `bash ~/.claude/scripts/hooks/memory-backup.sh push`
2. Report: what changes were pushed, to which repository

## Pull

If the user says "sync" or "pull":

1. Run `git pull` in the memory repository
2. If there are conflicts, show them and ask the user how to resolve
3. Report: what was pulled, any conflicts found

## Notes

- The SessionEnd hook auto-commits locally after every conversation
- This command handles the **push** to remote (GitHub, etc.)
- Push = one-way upload; Sync = bidirectional (push + pull)
