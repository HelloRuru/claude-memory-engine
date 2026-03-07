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

// === Smart Context: customize this for your projects ===
// Each entry maps a CWD keyword to memory files that should be loaded
const PROJECT_CONTEXT = [
  // Example:
  // {
  //   keywords: ['my-app'],        // if CWD contains 'my-app'
  //   name: 'My App',              // display name
  //   files: ['app-notes.md'],     // memory files to load
  // },
];

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

// === Smart Context：根據 CWD 載入對應記憶 ===
function loadSmartContext() {
  const cwd = process.cwd().replace(/\\/g, '/').toLowerCase();
  const matched = PROJECT_CONTEXT.find(p =>
    p.keywords.some(kw => cwd.includes(kw.toLowerCase()))
  );

  if (!matched) return null;
  if (!fs.existsSync(MEMORY_DIR)) return null;

  const loaded = [];
  for (const filename of matched.files) {
    const filepath = path.join(MEMORY_DIR, filename);
    if (!fs.existsSync(filepath)) continue;

    const content = fs.readFileSync(filepath, 'utf-8').trim();
    // 只載入前 50 行，避免 context 爆炸
    const lines = content.split('\n').slice(0, 50);
    loaded.push({ name: filename, content: lines.join('\n') });
  }

  return { project: matched.name, files: loaded };
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
