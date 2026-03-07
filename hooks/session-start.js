#!/usr/bin/env node
/**
 * SessionStart Hook — Memory Engine
 * 1. 載入上次 session 摘要
 * 2. Smart Context：根據 CWD 自動載入對應記憶檔
 * 3. 載入最近的踩坑紀錄
 * stdout 的內容會被 Claude 看到（注入 context）
 */

const fs = require('fs');
const path = require('path');

const HOME = process.env.HOME || process.env.USERPROFILE;
const SESSIONS_DIR = path.join(HOME, '.claude', 'sessions');
// Auto-detect project memory directory from CWD
// Claude Code stores project memory in ~/.claude/projects/{project-id}/memory/
// You may need to adjust this path for your setup
const MEMORY_DIR = path.join(HOME, '.claude', 'projects', getProjectId(), 'memory');

function getProjectId() {
  const cwd = process.cwd().replace(/\\/g, '/');
  const parts = cwd.split('/').filter(Boolean);
  if (parts.length === 0) return 'default';
  const drive = parts[0].replace(':', '');
  const rest = parts.slice(1).join('-');
  return `${drive}--${rest}`;
}
const LEARNED_DIR = path.join(HOME, '.claude', 'skills', 'learned');
const MAX_AGE_DAYS = 7;

// === Smart Context: auto-scan all project memory directories ===
function autoDetectProjectContext() {
  const projectsDir = path.join(HOME, '.claude', 'projects');
  if (!fs.existsSync(projectsDir)) return null;

  const cwd = process.cwd().replace(/\\/g, '/').toLowerCase();

  // 掃描所有專案目錄，找出有 memory/ 的
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const memDir = path.join(projectsDir, entry.name, 'memory');
    if (!fs.existsSync(memDir)) continue;

    // 從 project-id 還原路徑片段來比對 CWD
    // project-id 格式：drive--path-segments（例如 C--Users-kaoru-my-project）
    const segments = entry.name.split('--').join('/').split('-');
    const projectHint = segments.filter(s => s.length > 1).join('/').toLowerCase();

    // 檢查 CWD 是否包含這個專案的路徑片段
    const keyParts = entry.name.replace(/^[a-zA-Z]--/, '').split('-').filter(s => s.length > 2);
    const isMatch = keyParts.length > 0 && keyParts.every(part => cwd.includes(part.toLowerCase()));

    if (isMatch) {
      // 載入該專案 memory/ 下所有 .md 檔案
      const mdFiles = fs.readdirSync(memDir).filter(f => f.endsWith('.md'));
      const loaded = [];
      for (const filename of mdFiles) {
        const filepath = path.join(memDir, filename);
        const content = fs.readFileSync(filepath, 'utf-8').trim();
        // 只載入前 50 行，避免 context 爆炸
        const lines = content.split('\n').slice(0, 50);
        loaded.push({ name: filename, content: lines.join('\n') });
      }
      return { project: entry.name, files: loaded };
    }
  }
  return null;
}

// === 找最近的 session 摘要 ===
function findLatestSession() {
  if (!fs.existsSync(SESSIONS_DIR)) return null;

  const now = Date.now();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const files = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('-session.md'))
    .map(f => ({
      name: f,
      path: path.join(SESSIONS_DIR, f),
      mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
    }))
    .filter(f => (now - f.mtime) < maxAge)
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? files[0] : null;
}

// === Smart Context：自動偵測 CWD 對應的專案記憶 ===
function loadSmartContext() {
  return autoDetectProjectContext();
}

// === 找最近的踩坑紀錄 ===
function findRecentPitfalls() {
  if (!fs.existsSync(LEARNED_DIR)) return null;

  const now = Date.now();
  const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 天內

  const files = fs.readdirSync(LEARNED_DIR)
    .filter(f => f.startsWith('auto-pitfall-') && f.endsWith('.md'))
    .map(f => ({
      name: f,
      path: path.join(LEARNED_DIR, f),
      mtime: fs.statSync(path.join(LEARNED_DIR, f)).mtimeMs
    }))
    .filter(f => (now - f.mtime) < maxAge)
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? files[0] : null;
}

// === 主程式 ===
function main() {
  const output = [];

  try {
    // 1. 載入上次 session 摘要
    const latest = findLatestSession();
    if (latest) {
      const content = fs.readFileSync(latest.path, 'utf-8').trim();
      if (content && content.length >= 20) {
        const date = latest.name.split('-session.md')[0];
        output.push(`[Memory Engine] 上次工作摘要（${date}）：\n${content}`);
      }
    }

    if (output.length === 0) {
      output.push('[Memory Engine] 沒有找到最近的工作紀錄，這是全新的開始！');
    }

    // 2. Smart Context
    const context = loadSmartContext();
    if (context) {
      output.push(`\n[Memory Engine] 偵測到專案：${context.project}`);
      for (const file of context.files) {
        output.push(`--- ${file.name} ---\n${file.content}`);
      }
    }

    // 3. 最近踩坑
    const pitfall = findRecentPitfalls();
    if (pitfall) {
      const content = fs.readFileSync(pitfall.path, 'utf-8').trim();
      // 只取前 20 行
      const brief = content.split('\n').slice(0, 20).join('\n');
      output.push(`\n[Auto Learn] 最近踩坑紀錄：\n${brief}`);
    }
  } catch (err) {
    output.push('[Memory Engine] 載入記憶時發生問題，但不影響正常使用');
  }

  process.stdout.write(output.join('\n') + '\n');
}

main();
