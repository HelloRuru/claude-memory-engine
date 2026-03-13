#!/usr/bin/env node
/**
 * SessionStart Hook — Memory Engine SessionStart Hook
 * 1. 載入上次 session 摘要
 * 2. Smart Context：根據 CWD 自動載入對應記憶檔
 * 3. 載入最近的踩坑紀錄
 * stdout 的內容會被 Claude 看到（注入 context）
 */

const fs = require('fs');
const path = require('path');

const HOME = process.env.HOME || process.env.USERPROFILE;
const SESSIONS_DIR = path.join(HOME, '.claude', 'sessions');
const PROJECTS_DIR = path.join(HOME, '.claude', 'projects');
const FALLBACK_USER = (process.env.USER || process.env.USERNAME || 'user');
const FALLBACK_MEMORY_DIR = path.join(PROJECTS_DIR, `C--Users-${FALLBACK_USER}`, 'memory');
const LEARNED_DIR = path.join(HOME, '.claude', 'skills', 'learned');
const MAX_AGE_DAYS = 7;

// === 根據 CWD 找對應的 project memory 目錄 ===
function resolveMemoryDir() {
  const cwd = process.cwd().replace(/\\/g, '/');
  // Claude Code 的 project 目錄命名規則：路徑分隔符換成 --, 冒號去掉
  const slug = cwd.replace(/:/g, '').replace(/\//g, '-');

  // 嘗試精確匹配
  const exactDir = path.join(PROJECTS_DIR, slug, 'memory');
  if (fs.existsSync(exactDir)) return exactDir;

  // 嘗試小寫匹配（Windows 路徑大小寫不固定）
  if (fs.existsSync(PROJECTS_DIR)) {
    const cwdLower = slug.toLowerCase();
    const dirs = fs.readdirSync(PROJECTS_DIR);
    for (const d of dirs) {
      if (d.toLowerCase() === cwdLower) {
        const candidate = path.join(PROJECTS_DIR, d, 'memory');
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  // fallback 到預設目錄
  return FALLBACK_MEMORY_DIR;
}

const MEMORY_DIR = resolveMemoryDir();

// === Smart Context: project-specific memory files loaded based on CWD ===
// Add your own project entries here. Format:
//   { keywords: ['my-project'],        // substrings to match in CWD
//     name: 'My Project',              // display name
//     files: ['project-notes.md'] }    // memory files to auto-load
//
// Example:
//   { keywords: ['my-website'], name: 'My Website', files: ['site-config.md', 'troubleshooting.md'] },
const PROJECT_CONTEXT = [];

// === 找最近的 session 摘要 ===
function findLatestSession() {
  if (!fs.existsSync(SESSIONS_DIR)) return null;

  const now = Date.now();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const files = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('-session.md') || f.endsWith('-compact.md') || f.endsWith('-checkpoint.md'))
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

// === 讀待辦摘要 ===
function loadTodoSummary() {
  const todoFile = path.join(MEMORY_DIR, 'todo-status.md');
  if (!fs.existsSync(todoFile)) return null;

  const content = fs.readFileSync(todoFile, 'utf-8');
  const unchecked = (content.match(/^- \[ \]/gm) || []).length;
  const checked = (content.match(/^- \[x\]/gm) || []).length;

  if (unchecked === 0) return null;
  return { unchecked, checked, total: unchecked + checked };
}

// === 找 24 小時內改過的 memory 檔案 ===
function findRecentMemoryChanges() {
  if (!fs.existsSync(MEMORY_DIR)) return [];

  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 小時

  return fs.readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f,
      mtime: fs.statSync(path.join(MEMORY_DIR, f)).mtimeMs
    }))
    .filter(f => (now - f.mtime) < maxAge)
    .sort((a, b) => b.mtime - a.mtime)
    .map(f => f.name);
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

// === /reflect 提醒：檢查上次跑 reflect 是什麼時候 ===
function checkReflectReminder() {
  const reflectDir = path.join(HOME, '.claude', 'sessions');
  if (!fs.existsSync(reflectDir)) return null;

  try {
    // 找 reflect-*.md 檔案（/reflect 產出的結論）
    const reflectFiles = fs.readdirSync(reflectDir)
      .filter(f => f.startsWith('reflect-') && f.endsWith('.md'))
      .map(f => ({
        name: f,
        mtime: fs.statSync(path.join(reflectDir, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (reflectFiles.length === 0) {
      // 從來沒跑過 reflect
      return '[Memory Engine] You haven\'t run /reflect yet. After a few days of sessions, try running it to review patterns!';
    }

    const lastReflect = reflectFiles[0];
    const daysSince = Math.floor((Date.now() - lastReflect.mtime) / (24 * 60 * 60 * 1000));

    if (daysSince >= 7) {
      return `[Memory Engine] It's been ${daysSince} days since the last /reflect. Consider running it to consolidate memory!`;
    }
  } catch (e) {}

  return null;
}

// === 踩坑內化檢查：同類踩坑出現 3+ 次就提醒寫進長期記憶 ===
function checkRecurringPitfalls() {
  if (!fs.existsSync(LEARNED_DIR)) return [];

  // 掃描所有 auto-pitfall-*.md 檔案
  const files = fs.readdirSync(LEARNED_DIR)
    .filter(f => f.startsWith('auto-pitfall-') && f.endsWith('.md'));

  if (files.length === 0) return [];

  // 統計每個 type 在不同日期的檔案裡出現幾次
  // typeMap: { type -> { count, description, dates: Set } }
  const typeMap = new Map();

  for (const filename of files) {
    const filepath = path.join(LEARNED_DIR, filename);
    let content;
    try {
      content = fs.readFileSync(filepath, 'utf-8');
    } catch (e) {
      continue; // 讀不到就跳過，不卡住
    }

    // 從檔名抓日期（auto-pitfall-YYYYMMDD.md 或 auto-pitfall-YYYYMMDD-xxx.md）
    const dateMatch = filename.match(/auto-pitfall-(\d{8})/);
    const dateTag = dateMatch ? dateMatch[1] : filename;

    // 解析 ### type 區塊，取得 type 和 description
    const typeBlocks = content.match(/### (\S+)\n- (.+)/g);
    if (!typeBlocks) continue;

    for (const block of typeBlocks) {
      const match = block.match(/### (\S+)\n- (.+)/);
      if (!match) continue;
      const type = match[1];
      const description = match[2];

      if (!typeMap.has(type)) {
        typeMap.set(type, { count: 0, description, dates: new Set() });
      }
      const entry = typeMap.get(type);
      // 不同日期才多算一次（同天多個檔案不重複計算）
      if (!entry.dates.has(dateTag)) {
        entry.dates.add(dateTag);
        entry.count++;
        // 保留最新的 description（後面讀到的檔案較新）
        entry.description = description;
      }
    }
  }

  // 篩出 3 次以上、按次數排序、最多取 2 個
  const recurring = [...typeMap.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 2)
    .map(([, v]) => ({
      count: v.count,
      description: v.description,
    }));

  return recurring;
}

// === 交接偵測：讀取待處理的 handoff 檔案 / Detect pending handoff files ===
function findPendingHandoffs() {
  if (!fs.existsSync(MEMORY_DIR)) return [];

  const stateFile = path.join(SESSIONS_DIR, '.handoff-read.json');
  let readSet = new Set();
  try {
    if (fs.existsSync(stateFile)) {
      readSet = new Set(JSON.parse(fs.readFileSync(stateFile, 'utf-8')));
    }
  } catch (e) {}

  const handoffs = fs.readdirSync(MEMORY_DIR)
    .filter(f => f.startsWith('handoff-') && f.endsWith('.md'))
    .filter(f => !readSet.has(f))
    .map(f => {
      const fp = path.join(MEMORY_DIR, f);
      const content = fs.readFileSync(fp, 'utf-8').trim();
      // 去掉 frontmatter
      const body = content.replace(/^---[\s\S]*?---\s*/m, '').trim();
      return { name: f, body };
    })
    .filter(h => h.body.length > 0);

  // 標記為已讀 / Mark as read
  if (handoffs.length > 0) {
    for (const h of handoffs) readSet.add(h.name);
    try {
      fs.writeFileSync(stateFile, JSON.stringify([...readSet]), 'utf-8');
    } catch (e) {}
  }

  return handoffs;
}

// === 主程式 ===
function main() {
  const output = [];

  try {
    // 0. 交接偵測 / Handoff detection
    const handoffs = findPendingHandoffs();
    if (handoffs.length > 0) {
      output.push(`[Handoff] 收到 ${handoffs.length} 份交接：`);
      for (const h of handoffs) {
        output.push(`--- ${h.name} ---\n${h.body}`);
      }
    }

    // 1. 載入上次 session 摘要
    const latest = findLatestSession();
    if (latest) {
      const content = fs.readFileSync(latest.path, 'utf-8').trim();
      if (content && content.length >= 20) {
        const date = latest.name.replace(/-(session|compact|checkpoint)\.md$/, '');
        output.push(`[Session Hook] 上次工作摘要（${date}）：\n${content}`);
      }
    }

    if (output.length === 0) {
      output.push('[Session Hook] 沒有找到最近的工作紀錄，這是全新的開始！');
    }

    // 2. Smart Context
    const context = loadSmartContext();
    if (context) {
      output.push(`\n[Smart Context] 偵測到專案：${context.project}`);
      for (const file of context.files) {
        output.push(`--- ${file.name} ---\n${file.content}`);
      }
    }

    // 3. 待辦摘要
    const todos = loadTodoSummary();
    if (todos) {
      output.push(`[Todo] 未完成待辦 ${todos.unchecked} 項（共 ${todos.total} 項）`);
    }

    // 4. 最近改過的記憶檔案
    const recentChanges = findRecentMemoryChanges();
    if (recentChanges.length > 0) {
      output.push(`[Memory] 24h 內更新：${recentChanges.join(', ')}`);
    }

    // 5. 最近踩坑
    const pitfall = findRecentPitfalls();
    if (pitfall) {
      const content = fs.readFileSync(pitfall.path, 'utf-8').trim();
      // 只取前 20 行
      const brief = content.split('\n').slice(0, 20).join('\n');
      output.push(`\n[Auto Learn] 最近踩坑紀錄：\n${brief}`);
    }

    // 6. 踩坑內化檢查：重複踩坑 3+ 次就提醒
    const recurring = checkRecurringPitfalls();
    for (const item of recurring) {
      output.push(`[Memory Engine] This pitfall has recurred ${item.count} times: ${item.description}. Consider adding it to CLAUDE.md or memory, or address it in the next /reflect.`);
    }

    // 7. /reflect 提醒：太久沒跑就提醒
    const reflectReminder = checkReflectReminder();
    if (reflectReminder) {
      output.push(reflectReminder);
    }
  } catch (err) {
    output.push('[Session Hook] 載入記憶時發生問題，但不影響正常使用');
  }

  process.stdout.write(output.join('\n') + '\n');
}

main();
