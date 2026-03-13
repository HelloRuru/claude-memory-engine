#!/usr/bin/env node
/**
 * PreCompact Hook — 壓縮前快照（真正的安全網）
 * Pre-compact: snapshot before context compression (the real safety net)
 *
 * 比 SessionEnd 更常觸發（大部分對話不會正式結束）。
 * Fires more often than SessionEnd (most conversations don't formally end).
 *
 * 共用函式已抽到 shared-utils.js
 */

const fs = require('fs');
const path = require('path');
const {
  SESSIONS_DIR, ensureDir, debugLog: _debugLog,
  parseTranscript, detectProjectTag, detectPitfalls, savePitfalls,
  updateProjectIndex, autoBackup,
} = require('./shared-utils');

const log = (msg) => _debugLog(msg, 'pre-compact');

// === 主程式 / Main ===
function main(inputData) {
  log('=== pre-compact started ===');

  try {
    let data;
    try {
      data = JSON.parse(inputData);
    } catch (parseErr) {
      log(`JSON parse failed: ${parseErr.message}`);
      return;
    }

    const trigger = data.trigger || 'unknown'; // "auto" or "manual"
    const transcriptPath = data.transcript_path;
    log(`trigger: ${trigger}, transcript: ${transcriptPath}`);

    const parsed = parseTranscript(transcriptPath, log);
    if (!parsed) {
      log('parseTranscript returned null');
      return;
    }

    if (parsed.userMessages.length === 0) {
      log('no user messages, skipping');
      return;
    }

    log(`messages: ${parsed.userMessages.length}, tools: ${parsed.toolsUsed.join(',')}, files: ${parsed.filesModified.join(',')}`);

    // === 存壓縮前快照 / Save compact snapshot ===
    ensureDir(SESSIONS_DIR);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const shortId = (data.session_id || '').substring(0, 8) || Math.random().toString(36).substring(2, 6);
    const filename = `${dateStr}-${shortId}-compact.md`;

    const projectTag = detectProjectTag(parsed.userMessages, data.cwd, parsed.filesModified);
    log(`project: ${projectTag}`);

    const meaningfulMessages = parsed.userMessages.filter(m => m.length > 3);
    const titleHint = meaningfulMessages.slice(0, 5).join(' ').replace(/\n/g, ' ').substring(0, 60);
    const recentMessages = parsed.userMessages.slice(-8);

    const triggerLabel = trigger === 'auto' ? 'auto (context full)' : 'manual (/compact)';

    const summary = `# Compact Snapshot: ${dateStr}
**Project:** ${projectTag}
**Title:** ${titleHint}
**Time:** ${timeStr}
**Messages:** ${parsed.userMessages.length}
**Trigger:** ${triggerLabel}
**Type:** pre-compact snapshot (conversation continues after this)

## User Requests
${recentMessages.map(m => `- ${m}`).join('\n')}

## Tools Used
${parsed.toolsUsed.join(', ') || 'none'}

## Files Modified
${parsed.filesModified.length > 0 ? parsed.filesModified.map(f => `- ${f}`).join('\n') : 'none'}
`;

    fs.writeFileSync(path.join(SESSIONS_DIR, filename), summary, 'utf-8');
    log(`compact snapshot saved: ${filename}`);

    // === 更新專案索引 / Update project index ===
    updateProjectIndex(projectTag, dateStr, timeStr, titleHint, filename, 'compact');

    // === 踩坑偵測 / Pitfall detection ===
    const pitfalls = detectPitfalls(parsed);
    log(`pitfalls detected: ${pitfalls.length}`);
    if (pitfalls.length > 0) {
      savePitfalls(pitfalls);
    }

    // === 自動備份 / Auto backup ===
    autoBackup();

    log('=== pre-compact done ===');
  } catch (err) {
    log(`error: ${err.message}\n${err.stack}`);
  }
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => main(input));
