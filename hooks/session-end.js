#!/usr/bin/env node
/**
 * SessionEnd Hook — session 結束自動存檔 + 踩坑學習
 * Session end: auto-save summary + pitfall detection
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

const MAX_SESSIONS = 30;
const log = (msg) => _debugLog(msg, 'session-end');

// === 清理舊 session / Clean old sessions ===
function cleanOldSessions() {
  ensureDir(SESSIONS_DIR);
  const files = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('-session.md'))
    .map(f => ({
      name: f,
      path: path.join(SESSIONS_DIR, f),
      mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length > MAX_SESSIONS) {
    for (const old of files.slice(MAX_SESSIONS)) {
      try { fs.unlinkSync(old.path); } catch (e) {}
    }
  }
}

// === 主程式 / Main ===
function main(inputData) {
  log('=== session-end started ===');

  try {
    let data;
    try {
      data = JSON.parse(inputData);
    } catch (parseErr) {
      log(`JSON parse failed: ${parseErr.message}`);
      return;
    }

    const transcriptPath = data.transcript_path;
    log(`transcript_path: ${transcriptPath}`);

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

    // 存 session 摘要 / Save session summary
    ensureDir(SESSIONS_DIR);
    cleanOldSessions();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const shortId = Math.random().toString(36).substring(2, 6);
    const filename = `${dateStr}-${shortId}-session.md`;

    const recentMessages = parsed.userMessages.slice(-8);
    const projectTag = detectProjectTag(parsed.userMessages, data.cwd, parsed.filesModified);
    log(`project: ${projectTag}`);

    const meaningfulMessages = parsed.userMessages.filter(m => m.length > 3 && !/^(可以|好|ok|是|對|要|嗯)$/i.test(m.trim()));
    const allTopics = meaningfulMessages.slice(0, 5).join(' ').substring(0, 100);
    const titleHint = allTopics.replace(/\n/g, ' ').substring(0, 60);

    const summary = `# Session: ${dateStr}
**Project:** ${projectTag}
**Title:** ${titleHint}
**Time:** ${timeStr}
**Messages:** ${parsed.userMessages.length}

## User Requests
${recentMessages.map(m => `- ${m}`).join('\n')}

## Tools Used
${parsed.toolsUsed.join(', ') || 'none'}

## Files Modified
${parsed.filesModified.length > 0 ? parsed.filesModified.map(f => `- ${f}`).join('\n') : 'none'}
`;

    fs.writeFileSync(path.join(SESSIONS_DIR, filename), summary, 'utf-8');
    log(`session summary saved: ${filename}`);

    // 更新專案索引 / Update project index
    updateProjectIndex(projectTag, dateStr, timeStr, titleHint, filename);

    // 踩坑偵測 / Pitfall detection
    const pitfalls = detectPitfalls(parsed);
    log(`pitfalls detected: ${pitfalls.length}`);
    if (pitfalls.length > 0) {
      savePitfalls(pitfalls);
    }

    // 自動備份 / Auto backup
    autoBackup();

    log('=== session-end done ===');
  } catch (err) {
    log(`error: ${err.message}\n${err.stack}`);
  }
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => main(input));
