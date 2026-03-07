#!/usr/bin/env node
/**
 * PreToolUse Hook — Git Push 前檢查提醒
 * 匹配 Bash 工具，攔截 git push 相關指令
 * 同時檢查 staged files 有沒有敏感檔案
 */

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const command = data.tool_input?.command || '';

    if (/git\s+push/.test(command)) {
      process.stdout.write(
        '[Memory Engine] About to push to remote! Please verify:\n' +
        '  1. No files missing from git status\n' +
        '  2. Commit message is accurate\n' +
        '  3. No accidental sensitive files（.env、credentials）\n'
      );

      // 實際檢查 staged 檔案
      try {
        const { execSync } = require('child_process');
        const staged = execSync('git diff --cached --name-only 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
        const sensitivePatterns = [/\.env$/, /credentials/i, /\.secret/i, /password/i, /\.pem$/, /\.key$/];
        const dangerousFiles = staged.split('\n').filter(f =>
          f.trim() && sensitivePatterns.some(p => p.test(f))
        );
        if (dangerousFiles.length > 0) {
          process.stdout.write('[Memory Engine WARNING] Sensitive files found in staging: ' + dangerousFiles.join(', ') + '\n');
        }
      } catch (e) {}
    }

    if (/git\s+push\s+.*--force/.test(command) || /git\s+push\s+-f\b/.test(command)) {
      process.stdout.write('[Memory Engine WARNING] Force push detected! This will overwrite remote history. Be careful!\n');
    }

    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});
