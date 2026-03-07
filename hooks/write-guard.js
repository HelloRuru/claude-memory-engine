#!/usr/bin/env node
/**
 * PreToolUse Hook — Write Guard
 * Warns before writing to sensitive files or creating unnecessary .md files
 */

const path = require('path');
const readline = require('readline');

// Sensitive file patterns (with reason for warning)
const PROTECTED_PATTERNS = [
  { pattern: /\.env$/, reason: 'May contain API keys or passwords - could leak if pushed to GitHub' },
  { pattern: /credentials/i, reason: 'Filename contains credentials - may contain account credentials' },
  { pattern: /\.secret/i, reason: 'Filename contains secret - may contain sensitive data' },
  { pattern: /password/i, reason: 'Filename contains password' },
];

// Unnecessary files (warn but don't block)
const WARN_PATTERNS = [
  /^README\.md$/i,
  /^CHANGELOG\.md$/i,
  /^TODO\.md$/i,
];

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path || '';
    const filename = path.basename(filePath);
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Allowed paths (local credential stores you trust)
    const ALLOWED_PATHS = [
      /\.cloudflare\//i,
    ];

    const isAllowed = ALLOWED_PATHS.some(p => p.test(normalizedPath));

    // Warn about sensitive files (non-blocking, just a heads-up)
    for (const { pattern, reason } of PROTECTED_PATTERNS) {
      if (pattern.test(filename) && !isAllowed) {
        process.stdout.write(`[Memory Engine] Writing ${filename} — ${reason}\n`);
      }
    }

    // Warn about potentially unnecessary files
    for (const pattern of WARN_PATTERNS) {
      if (pattern.test(filename)) {
        process.stdout.write(`[Memory Engine] Creating ${filename} -- Is this needed?\n`);
      }
    }

    process.exit(0); // allow
  } catch (e) {
    process.exit(0);
  }
});
