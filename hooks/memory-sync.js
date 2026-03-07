#!/usr/bin/env node
/**
 * UserPromptSubmit Hook — 跨 Session 記憶同步 + 變更摘要注入
 * 偵測 MEMORY.md 被其他 session 更新時，注入變更內容給 Claude
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.claude', 'projects'
);

const STATE_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.claude', 'scripts', 'hooks', '.memory-sync-state.json'
);

function getProjectMemoryDir() {
  const parts = process.cwd().replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const drive = parts[0].replace(':', '');
  const rest = parts.slice(1).join('-');
  const projectId = `${drive}--${rest}`;

  const memDir = path.join(MEMORY_DIR, projectId, 'memory');
  if (fs.existsSync(memDir)) return memDir;

  // fallback：嘗試家目錄的 memory
  const homeId = `${drive}--Users-${parts[1] || 'user'}`;
  const homeMemDir = path.join(MEMORY_DIR, homeId, 'memory');
  if (fs.existsSync(homeMemDir)) return homeMemDir;

  return null;
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state), 'utf-8');
  } catch (e) {}
}

// 簡單的 diff：找出新增的
function getChangedLines(oldContent, newContent) {
  const oldLines = new Set(oldContent.split('\n').map(l => l.trim()).filter(Boolean));
  const newLines = newContent.split('\n').map(l => l.trim()).filter(Boolean);
  return newLines.filter(l => !oldLines.has(l));
}

function main() {
  try {
    const memDir = getProjectMemoryDir();
    if (!memDir) return;

    const memoryFile = path.join(memDir, 'MEMORY.md');
    if (!fs.existsSync(memoryFile)) return;

    const stat = fs.statSync(memoryFile);
    const currentMtime = stat.mtimeMs;
    const currentContent = fs.readFileSync(memoryFile, 'utf-8');

    const state = loadState();
    const lastMtime = state[memoryFile + ':mtime'] || 0;
    const lastHash = state[memoryFile + ':hash'] || '';

    // 用內容 hash 判斷（比 mtime 更準）
    const currentHash = Buffer.from(currentContent).toString('base64').substring(0, 32);

    if (lastMtime === 0 || lastHash === '') {
      // 第一次執，記錄狀態
      state[memoryFile + ':mtime'] = currentMtime;
      state[memoryFile + ':hash'] = currentHash;
      state[memoryFile + ':content'] = currentContent;
      saveState(state);
      return;
    }

    if (currentHash !== lastHash) {
      // 記憶有變更！找出改了什麼
      const oldContent = state[memoryFile + ':content'] || '';
      const changedLines = getChangedLines(oldContent, currentContent);

      // 同時檢查其他 md 檔案
      const changedFiles = [];
      const mdFiles = fs.readdirSync(memDir).filter(f => f.endsWith('.md'));
      for (const f of mdFiles) {
        const fp = path.join(memDir, f);
        const fstat = fs.statSync(fp);
        const fLastMtime = state[fp + ':mtime'] || 0;
        if (fstat.mtimeMs > fLastMtime) {
          changedFiles.push(f);
          state[fp + ':mtime'] = fstat.mtimeMs;
        }
      }

      // 更新狀態
      state[memoryFile + ':mtime'] = currentMtime;
      state[memoryFile + ':hash'] = currentHash;
      state[memoryFile + ':content'] = currentContent;
      saveState(state);

      // 注入變更摘要
      const output = [];
      if (changedFiles.length > 0) {
        output.push(`[Memory Sync] Memory files were updated：${changedFiles.join(', ')}`);
      }
      if (changedLines.length > 0) {
        const preview = changedLines.slice(0, 5).join('\n  ');
        output.push(`[Memory Sync] New or modified content：\n  ${preview}`);
        if (changedLines.length > 5) {
          output.push(`  ...and ${changedLines.length - 5} `);
        }
      }

      if (output.length > 0) {
        process.stdout.write(output.join('\n') + '\n');
      }
    }
  } catch (err) {
    // 靜默失敗
  }
}

main();
