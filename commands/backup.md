# /backup -- Push Memory to GitHub

Sync local memory files to your GitHub backup repository.

## Steps

1. **Scan local memory** -- Read all `.md` files in `~/.claude/projects/{current-project}/memory/`
2. **Fetch remote SHA** -- Use `gh api` to get the latest SHA for each file (must fetch fresh every time, no cache)
3. **Compare** -- Only push files that have changed
4. **Push updates** -- Use `gh api` PUT to update changed files on GitHub
5. **Verify** -- Confirm push succeeded, list which files were updated
6. **Report** -- Brief summary of backup results

## Notes

- Always fetch the latest SHA before updating to avoid conflicts
- Handle non-ASCII filenames with URL encoding
- If GitHub API returns an error, report it -- don't retry more than 3 times
- The SessionEnd hook auto-commits locally; this command handles the push
