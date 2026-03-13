#!/usr/bin/env node
/**
 * Shared Utils — session-end / pre-compact / handoff 共用函式
 *
 * 抽出重複程式碼，改一處全部生效。
 * 共用：ensureDir, debugLog, findFallbackTranscript, parseTranscript,
 *       detectProjectTag, detectPitfalls, savePitfalls, updateProjectIndex, autoBackup
 */

const fs = require('fs');
const path = require('path');

const HOME = process.env.HOME || process.env.USERPROFILE;
const SESSIONS_DIR = path.join(HOME, '.claude', 'sessions');
const LEARNED_DIR = path.join(HOME, '.claude', 'skills', 'learned');
const DEBUG_LOG = path.join(SESSIONS_DIR, 'debug.log');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function debugLog(msg, prefix = '') {
  ensureDir(SESSIONS_DIR);
  const ts = new Date().toISOString();
  const tag = prefix ? ` [${prefix}]` : '';
  fs.appendFileSync(DEBUG_LOG, `[${ts}]${tag} ${msg}\n`, 'utf-8');
}

// === 尋找 fallback transcript / Find fallback transcript ===
function findFallbackTranscript(originalPath) {
  const projectsDir = path.join(HOME, '.claude', 'projects');
  const searchDirs = [];

  if (originalPath) {
    const dir = path.dirname(originalPath);
    if (fs.existsSync(dir)) searchDirs.push(dir);
  }

  if (fs.existsSync(projectsDir)) {
    try {
      const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          searchDirs.push(path.join(projectsDir, entry.name));
        }
      }
    } catch (e) {}
  }

  let bestFile = null;
  let bestMtime = 0;

  for (const dir of searchDirs) {
    try {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl'));
      for (const f of files) {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        if (stat.mtimeMs > bestMtime) {
          bestMtime = stat.mtimeMs;
          bestFile = fp;
        }
      }
    } catch (e) {}
  }

  // 只接受 10 分鐘內修改過的檔案 / Only accept files modified within 10 minutes
  if (bestFile && (Date.now() - bestMtime) < 10 * 60 * 1000) {
    return bestFile;
  }
  return null;
}

// === 專案歸屬偵測 / Detect project tag from CWD, files, messages ===
function detectProjectTag(userMessages, inputCwd, filesModified) {
  // Add your own project patterns here. Each entry maps a regex to a project tag.
  // Example:
  //   { pattern: /my-website/i, tag: 'my-website' },
  //   { pattern: /client-project/i, tag: 'client-project' },
  const projectPatterns = [
    { pattern: /claude-memory-engine/i, tag: 'claude-memory-engine' },
  ];

  // 1. 從 CWD 推斷 / From CWD
  const cwd = (inputCwd || process.cwd()).replace(/\\/g, '/');
  for (const { pattern, tag } of projectPatterns) {
    if (pattern.test(cwd)) return tag;
  }

  // 2. 從修改的檔案路徑推斷 / From modified files
  if (filesModified && filesModified.length > 0) {
    const allPaths = filesModified.join(' ');
    for (const { pattern, tag } of projectPatterns) {
      if (pattern.test(allPaths)) return tag;
    }
  }

  // 3. 從使用者訊息推斷 / From user messages
  const allText = (userMessages || []).slice(0, 10).join(' ');
  for (const { pattern, tag } of projectPatterns) {
    if (pattern.test(allText)) return tag;
  }

  // 4. 從記憶引擎相關檔案推斷 / From memory engine files
  if (filesModified && filesModified.some(f =>
    /session-end|session-start|checkpoint|memory-sync|MEMORY\.md|todo-status/i.test(f)
  )) {
    return 'claude-memory-engine';
  }

  // 5. 從 CWD 取最後一層目錄名 / Last directory name from CWD
  const parts = cwd.split('/').filter(Boolean);
  const lastDir = parts[parts.length - 1] || '';
  const currentUser = (process.env.USER || process.env.USERNAME || '').toLowerCase();
  if (lastDir && lastDir !== currentUser && lastDir !== 'Users') {
    return lastDir.toLowerCase();
  }

  return 'general';
}

// === 解析 transcript / Parse transcript JSONL ===
function parseTranscript(transcriptPath, log) {
  const _log = log || ((m) => debugLog(m));

  if (!transcriptPath) {
    _log('transcript_path is empty');
    return null;
  }

  let actualPath = transcriptPath;
  if (!fs.existsSync(transcriptPath)) {
    _log(`transcript not found: ${transcriptPath}, trying fallback...`);
    actualPath = findFallbackTranscript(transcriptPath);
    if (!actualPath) {
      _log('fallback also failed');
      return null;
    }
    _log(`fallback found: ${actualPath}`);
  }

  const lines = fs.readFileSync(actualPath, 'utf-8').trim().split('\n');
  _log(`transcript has ${lines.length} lines`);

  const userMessages = [];
  const toolsUsed = new Set();
  const filesModified = new Set();
  const toolCalls = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const entryType = entry.type;
      const msg = entry.message;
      if (!msg) continue;

      // 擷取使用者訊息 / Extract user messages
      if (entryType === 'user' && msg.content) {
        const content = msg.content;
        const text = typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content.filter(c => c.type === 'text').map(c => c.text).join(' ')
            : '';
        // 過濾系統注入 / Filter system injections
        const cleaned = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
                           .replace(/<ide_[\s\S]*?>/g, '')
                           .replace(/^The user opened the file[\s\S]*?$/gm, '')
                           .replace(/<available-deferred-tools>[\s\S]*?<\/available-deferred-tools>/g, '')
                           .trim();
        if (cleaned && cleaned.length > 0 && !cleaned.startsWith('<') && !cleaned.startsWith('The user') && !cleaned.startsWith('This session is being continued')) {
          userMessages.push(cleaned.substring(0, 200));
        }
      }

      // 擷取工具呼叫 / Extract tool calls
      if (entryType === 'assistant' && Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === 'tool_use') {
            toolsUsed.add(block.name);
            const fp = block.input?.file_path || block.input?.path || block.input?.command || '';
            toolCalls.push({
              name: block.name,
              target: typeof fp === 'string' ? path.basename(fp) : '',
              id: block.id,
            });
            if (['Edit', 'Write'].includes(block.name) && block.input) {
              const filePath = block.input.file_path || block.input.path;
              if (filePath) filesModified.add(path.basename(filePath));
            }
          }
          // 擷取工具結果 / Extract tool results
          if (block.type === 'tool_result' && block.content) {
            const resultText = typeof block.content === 'string'
              ? block.content
              : Array.isArray(block.content)
                ? block.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
                : '';
            const lastCall = toolCalls[toolCalls.length - 1];
            if (lastCall) {
              lastCall.hasError = /error|Error|failed|Failed|FAILED|not found|does not exist|TypeError|SyntaxError/.test(resultText);
              lastCall.resultSnippet = resultText.substring(0, 150);
            }
          }
        }
      }
    } catch (e) {}
  }

  return { userMessages, toolsUsed: [...toolsUsed], filesModified: [...filesModified], toolCalls };
}

// === 踩坑偵測 / Detect pitfalls from tool calls and user messages ===
function detectPitfalls(parsed) {
  if (!parsed || !parsed.toolCalls) return [];
  const pitfalls = [];

  // 正常重複的工具不算踩坑 / Tools that normally repeat
  const normalRepeatTools = new Set(['TodoWrite', 'Agent', 'Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch']);

  // 訊號 1：重試 5+ 次 / Signal 1: retry 5+ times
  const retryMap = new Map();
  for (const call of parsed.toolCalls) {
    if (normalRepeatTools.has(call.name)) continue;
    const key = `${call.name}:${call.target}`;
    retryMap.set(key, (retryMap.get(key) || 0) + 1);
  }
  for (const [key, count] of retryMap) {
    if (count >= 5) {
      const [tool, target] = key.split(':');
      pitfalls.push({
        type: 'retry',
        description: `${tool} retried ${target || 'same target'} ${count} times`,
        target,
      });
    }
  }

  // 訊號 2：錯誤後修正 / Signal 2: error then fix
  for (let i = 0; i < parsed.toolCalls.length; i++) {
    const call = parsed.toolCalls[i];
    if (!call.hasError) continue;
    for (let j = i + 1; j < parsed.toolCalls.length; j++) {
      const later = parsed.toolCalls[j];
      if (later.name === call.name && later.target === call.target && !later.hasError) {
        pitfalls.push({
          type: 'error-then-fix',
          description: `${call.name} on ${call.target}: failed then succeeded`,
          errorSnippet: call.resultSnippet,
          target: call.target,
        });
        break;
      }
    }
  }

  // 訊號 3：使用者糾正 / Signal 3: user correction
  const correctionKeywords = ['不對', '錯了', '不是這個', '改回來', '搞錯', '弄錯', '我說的是',
                              'wrong', 'not that', 'revert', 'undo'];
  for (const msg of (parsed.userMessages || [])) {
    if (correctionKeywords.some(kw => msg.includes(kw))) {
      pitfalls.push({
        type: 'user-correction',
        description: `User correction: ${msg.substring(0, 80)}`,
        target: '',
      });
    }
  }

  return pitfalls;
}

// === 存踩坑紀錄 / Save pitfall record ===
function savePitfalls(pitfalls) {
  if (pitfalls.length === 0) return;
  ensureDir(LEARNED_DIR);

  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const slug = `auto-pitfall-${dateStr}`;
  let filename = `${slug}.md`;
  const filepath = path.join(LEARNED_DIR, filename);

  if (fs.existsSync(filepath)) {
    const seq = Math.random().toString(36).substring(2, 5);
    filename = `${slug}-${seq}.md`;
  }

  const content = `# Pitfall Record ${new Date().toISOString().split('T')[0]}

## Detected Issues

${pitfalls.map(p => `### ${p.type}
- ${p.description}
${p.errorSnippet ? `- error snippet: \`${p.errorSnippet}\`` : ''}`).join('\n\n')}
`;

  fs.writeFileSync(path.join(LEARNED_DIR, filename), content, 'utf-8');
  debugLog(`pitfall saved: ${filename} (${pitfalls.length} items)`);
}

// === 更新專案索引 / Update project session index ===
function updateProjectIndex(projectTag, dateStr, timeStr, titleHint, filename, label) {
  try {
    const indexFile = path.join(SESSIONS_DIR, 'project-index.md');
    const indexMap = new Map();

    if (fs.existsSync(indexFile)) {
      const existing = fs.readFileSync(indexFile, 'utf-8');
      const lines = existing.split('\n');
      let currentProject = '';
      for (const line of lines) {
        const projMatch = line.match(/^## (.+)/);
        if (projMatch) {
          currentProject = projMatch[1];
          if (!indexMap.has(currentProject)) indexMap.set(currentProject, []);
        } else if (line.startsWith('- ') && currentProject) {
          indexMap.get(currentProject).push(line);
        }
      }
    }

    if (!indexMap.has(projectTag)) indexMap.set(projectTag, []);
    const entries = indexMap.get(projectTag);
    const tag = label ? `[${label}] ` : '';
    const newEntry = `- ${dateStr} ${timeStr} | ${tag}${titleHint} | ${filename}`;
    entries.push(newEntry);

    // 每個專案最多保留 20 筆 / Keep max 20 per project
    if (entries.length > 20) {
      indexMap.set(projectTag, entries.slice(-20));
    }

    const sortedProjects = [...indexMap.keys()].sort();
    let indexContent = `# Project Session Index\n\n> Auto-maintained. /reflect reads this file.\n\n`;
    for (const proj of sortedProjects) {
      indexContent += `## ${proj}\n${indexMap.get(proj).join('\n')}\n\n`;
    }
    fs.writeFileSync(indexFile, indexContent, 'utf-8');
    debugLog(`project index updated: ${projectTag}`);
  } catch (indexErr) {
    debugLog(`project index update failed: ${indexErr.message}`);
  }
}

// === 自動備份 commit / Auto backup commit ===
function autoBackup() {
  try {
    const { execSync } = require('child_process');
    const backupScript = path.join(HOME, '.claude', 'scripts', 'hooks', 'memory-backup.sh');
    if (fs.existsSync(backupScript)) {
      execSync(`bash "${backupScript}"`, { timeout: 10000, stdio: 'ignore' });
      debugLog('auto backup commit done');
    }
  } catch (backupErr) {
    debugLog(`auto backup failed: ${backupErr.message}`);
  }
}

module.exports = {
  HOME,
  SESSIONS_DIR,
  LEARNED_DIR,
  DEBUG_LOG,
  ensureDir,
  debugLog,
  findFallbackTranscript,
  detectProjectTag,
  parseTranscript,
  detectPitfalls,
  savePitfalls,
  updateProjectIndex,
  autoBackup,
};
