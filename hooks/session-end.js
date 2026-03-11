#!/usr/bin/env node
/**
 * SessionEnd Hook — 小八自動存檔 + 踩坑學習系統
 * 1. 每次 session 結束自動儲存工作摘要
 * 2. 偵測踩坑模式，自動存到 learned/
 * 從 stdin 讀取 JSON（含 transcript_path）
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'sessions');
const LEARNED_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'skills', 'learned');
const DEBUG_LOG = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'sessions', 'debug.log');
const MAX_SESSIONS = 30;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function debugLog(msg) {
  ensureDir(SESSIONS_DIR);
  const ts = new Date().toISOString();
  fs.appendFileSync(DEBUG_LOG, `[${ts}] ${msg}\n`, 'utf-8');
}

// === 尋找 fallback transcript ===
function findFallbackTranscript(originalPath) {
  // 從原始路徑推斷專案目錄
  const projectsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'projects');
  const searchDirs = [];

  // 1. 嘗試從原始路徑取出專案目錄
  if (originalPath) {
    const dir = path.dirname(originalPath);
    if (fs.existsSync(dir)) searchDirs.push(dir);
  }

  // 2. 掃描所有專案目錄
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

  // 只接受 10 分鐘內修改過的檔案（避免抓到舊 session）
  if (bestFile && (Date.now() - bestMtime) < 10 * 60 * 1000) {
    return bestFile;
  }
  return null;
}

// === 從 CWD / transcript CWD / 修改檔案 / 訊息推斷專案歸屬 ===
function detectProjectTag(userMessages, inputCwd, filesModified) {
  const projectPatterns = [
    { pattern: /ohruru/i, tag: 'ohruru' },
    { pattern: /tools[\/\\]|tools$/i, tag: 'tools' },
    { pattern: /helloruru\.github\.io|[\/\\]lab[\/\\]?$/i, tag: 'lab' },
    { pattern: /helloruru-blog|blog/i, tag: 'blog' },
    { pattern: /ebook-deals/i, tag: 'ebook-deals' },
    { pattern: /claude-memory-engine/i, tag: 'claude-memory-engine' },
    { pattern: /claude-teams-go/i, tag: 'claude-teams-go' },
    { pattern: /claude-zhenhuan/i, tag: 'claude-zhenhuan' },
    { pattern: /happy-exit/i, tag: 'happy-exit' },
    { pattern: /美龍|meilong/i, tag: 'client-meilong' },
  ];

  // 1. 從 SessionEnd 傳入的 CWD 推斷（最可靠）
  const cwd = (inputCwd || process.cwd()).replace(/\\/g, '/');
  for (const { pattern, tag } of projectPatterns) {
    if (pattern.test(cwd)) return tag;
  }

  // 2. 從修改的檔案路徑推斷
  if (filesModified && filesModified.length > 0) {
    const allPaths = filesModified.join(' ');
    for (const { pattern, tag } of projectPatterns) {
      if (pattern.test(allPaths)) return tag;
    }
  }

  // 3. 從嚕寶訊息內容推斷
  const allText = userMessages.slice(0, 10).join(' ');
  for (const { pattern, tag } of projectPatterns) {
    if (pattern.test(allText)) return tag;
  }

  // 4. 從修改的記憶引擎相關檔案推斷
  if (filesModified && filesModified.some(f =>
    /session-end|session-start|checkpoint|memory-sync|MEMORY\.md|todo-status/i.test(f)
  )) {
    return 'claude-memory-engine';
  }

  // 5. 從 CWD 取最後一層目錄名
  const parts = cwd.split('/').filter(Boolean);
  const lastDir = parts[parts.length - 1] || '';
  if (lastDir && lastDir !== 'kaoru' && lastDir !== 'Users') {
    return lastDir.toLowerCase();
  }

  return 'general';
}

// === 解析 transcript ===
function parseTranscript(transcriptPath) {
  if (!transcriptPath) {
    debugLog('transcript_path 是空的');
    return null;
  }

  // Fallback：如果指定路徑不存在，找最近修改的 .jsonl
  let actualPath = transcriptPath;
  if (!fs.existsSync(transcriptPath)) {
    debugLog(`transcript 檔案不存在: ${transcriptPath}，嘗試 fallback...`);
    actualPath = findFallbackTranscript(transcriptPath);
    if (!actualPath) {
      debugLog('fallback 也找不到合適的 transcript');
      return null;
    }
    debugLog(`fallback 找到: ${actualPath}`);
  }

  const lines = fs.readFileSync(actualPath, 'utf-8').trim().split('\n');
  debugLog(`transcript 共 ${lines.length} 行`);

  const userMessages = [];
  const toolsUsed = new Set();
  const filesModified = new Set();
  const toolCalls = []; // 用來偵測踩坑

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // transcript 格式：{ type: "user"|"assistant", message: { role, content } }
      const entryType = entry.type;
      const msg = entry.message;
      if (!msg) continue; // 跳過 progress/queue-operation 等非訊息行

      // 擷取使用者訊息
      if (entryType === 'user' && msg.content) {
        const content = msg.content;
        const text = typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content.filter(c => c.type === 'text').map(c => c.text).join(' ')
            : '';
        // 過濾掉系統注入的 IDE 訊息和 system-reminder
        const cleaned = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
                           .replace(/<ide_[\s\S]*?>/g, '')
                           .replace(/^The user opened the file[\s\S]*?$/gm, '')
                           .replace(/<available-deferred-tools>[\s\S]*?<\/available-deferred-tools>/g, '')
                           .trim();
        if (cleaned && cleaned.length > 0 && !cleaned.startsWith('<') && !cleaned.startsWith('The user') && !cleaned.startsWith('This session is being continued')) {
          userMessages.push(cleaned.substring(0, 200));
        }
      }

      // 擷取工具呼叫和結果
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
          // 擷取工具結果（偵測錯誤）
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
    } catch (e) {
      // 跳過無法解析的行
    }
  }

  return { userMessages, toolsUsed: [...toolsUsed], filesModified: [...filesModified], toolCalls };
}

// === 踩坑偵測 ===
function detectPitfalls(parsed) {
  if (!parsed || !parsed.toolCalls) return [];
  const pitfalls = [];

  // 正常重複使用的工具不算踩坑（這些本來就會對同目標呼叫多次）
  const normalRepeatTools = new Set(['TodoWrite', 'Agent', 'Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch']);

  // 訊號 1：重試 5+ 次（只看寫入類工具）
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
        description: `${tool} 對 ${target || '同一指令'} 重試了 ${count} 次`,
        target,
      });
    }
  }

  // 訊號 2：錯誤後修正
  for (let i = 0; i < parsed.toolCalls.length; i++) {
    const call = parsed.toolCalls[i];
    if (!call.hasError) continue;
    // 往後找同工具同目標的成功呼叫
    for (let j = i + 1; j < parsed.toolCalls.length; j++) {
      const later = parsed.toolCalls[j];
      if (later.name === call.name && later.target === call.target && !later.hasError) {
        pitfalls.push({
          type: 'error-then-fix',
          description: `${call.name} 對 ${call.target} 先失敗後成功`,
          errorSnippet: call.resultSnippet,
          target: call.target,
        });
        break;
      }
    }
  }

  // 訊號 3：使用者糾正（只抓明確的糾正語氣，「應該是」太寬容易誤判）
  const correctionKeywords = ['不對', '錯了', '不是這個', '改回來', '搞錯', '弄錯', '我說的是'];
  for (const msg of parsed.userMessages) {
    if (correctionKeywords.some(kw => msg.includes(kw))) {
      pitfalls.push({
        type: 'user-correction',
        description: `嚕寶糾正：${msg.substring(0, 80)}`,
        target: '',
      });
    }
  }

  return pitfalls;
}

// === 存踩坑紀錄 ===
function savePitfalls(pitfalls) {
  if (pitfalls.length === 0) return;
  ensureDir(LEARNED_DIR);

  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  // 合併所有踩坑成一份紀錄
  const slug = `auto-pitfall-${dateStr}`;
  let filename = `${slug}.md`;
  const filepath = path.join(LEARNED_DIR, filename);

  // 如果同名已存在就加序號
  if (fs.existsSync(filepath)) {
    const seq = Math.random().toString(36).substring(2, 5);
    filename = `${slug}-${seq}.md`;
  }

  const content = `# 踩坑紀錄 ${new Date().toISOString().split('T')[0]}

## 偵測到的問題

${pitfalls.map(p => `### ${p.type}
- ${p.description}
${p.errorSnippet ? `- 錯誤片段：\`${p.errorSnippet}\`` : ''}`).join('\n\n')}

## 教訓

（下次 session 開始時，小八會讀取這份紀錄並提醒自己）
`;

  fs.writeFileSync(path.join(LEARNED_DIR, filename), content, 'utf-8');
  debugLog(`踩坑紀錄已存：${filename}（${pitfalls.length} 項）`);
}

// === 清理舊 session ===
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

// === 主程式 ===
function main(inputData) {
  debugLog('=== session-end 開始執行 ===');
  debugLog(`收到的 input 長度: ${inputData.length}`);

  try {
    let data;
    try {
      data = JSON.parse(inputData);
    } catch (parseErr) {
      debugLog(`JSON 解析失敗: ${parseErr.message}`);
      debugLog(`input 前 200 字: ${inputData.substring(0, 200)}`);
      return;
    }

    debugLog(`data keys: ${Object.keys(data).join(', ')}`);
    const transcriptPath = data.transcript_path;
    debugLog(`transcript_path: ${transcriptPath}`);

    const parsed = parseTranscript(transcriptPath);
    if (!parsed) {
      debugLog('parseTranscript 回傳 null，結束');
      return;
    }

    if (parsed.userMessages.length === 0) {
      debugLog('沒有使用者訊息，結束');
      return;
    }

    debugLog(`使用者訊息: ${parsed.userMessages.length} 則, 工具: ${parsed.toolsUsed.join(',')}, 修改檔案: ${parsed.filesModified.join(',')}`);

    // 存 session 摘要
    ensureDir(SESSIONS_DIR);
    cleanOldSessions();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const shortId = Math.random().toString(36).substring(2, 6);
    const filename = `${dateStr}-${shortId}-session.md`;

    const recentMessages = parsed.userMessages.slice(-8);

    // 推斷專案歸屬（傳入 CWD + 修改檔案，提高準確度）
    const projectTag = detectProjectTag(parsed.userMessages, data.cwd, parsed.filesModified);
    debugLog(`專案歸屬: ${projectTag}`);

    // 產生標題級摘要（取最有意義的訊息，過濾掉太短的回應）
    const meaningfulMessages = parsed.userMessages.filter(m => m.length > 3 && !/^(可以|好|ok|是|對|要|嗯)$/i.test(m.trim()));
    const allTopics = meaningfulMessages.slice(0, 5).join(' ').substring(0, 100);
    const titleHint = allTopics.replace(/\n/g, ' ').substring(0, 60);

    const summary = `# Session: ${dateStr}
**專案：** ${projectTag}
**標題：** ${titleHint}
**時間：** ${timeStr}
**訊息數：** ${parsed.userMessages.length}

## 嚕寶的要求
${recentMessages.map(m => `- ${m}`).join('\n')}

## 使用的工具
${parsed.toolsUsed.join(', ') || '無'}

## 修改的檔案
${parsed.filesModified.length > 0 ? parsed.filesModified.map(f => `- ${f}`).join('\n') : '無'}
`;

    fs.writeFileSync(path.join(SESSIONS_DIR, filename), summary, 'utf-8');
    debugLog(`session 摘要已存: ${filename}`);

    // 更新專案索引（串連用）
    try {
      const indexFile = path.join(SESSIONS_DIR, 'project-index.md');
      let indexContent = '';
      const indexMap = new Map(); // projectTag -> [sessions]

      // 讀取既有索引
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

      // 加入這次 session
      if (!indexMap.has(projectTag)) indexMap.set(projectTag, []);
      const entries = indexMap.get(projectTag);
      const newEntry = `- ${dateStr} ${timeStr} | ${titleHint} | ${filename}`;
      entries.push(newEntry);

      // 每個專案最多保留 20 筆
      if (entries.length > 20) {
        indexMap.set(projectTag, entries.slice(-20));
      }

      // 寫回索引
      const sortedProjects = [...indexMap.keys()].sort();
      indexContent = `# 專案 Session 索引\n\n> 自動維護，/reflect 讀這個檔案就好\n\n`;
      for (const proj of sortedProjects) {
        indexContent += `## ${proj}\n${indexMap.get(proj).join('\n')}\n\n`;
      }
      fs.writeFileSync(indexFile, indexContent, 'utf-8');
      debugLog(`專案索引已更新: ${projectTag}`);
    } catch (indexErr) {
      debugLog(`專案索引更新失敗（不影響主流程）: ${indexErr.message}`);
    }

    // 踩坑偵測
    const pitfalls = detectPitfalls(parsed);
    debugLog(`踩坑偵測結果: ${pitfalls.length} 項`);
    if (pitfalls.length > 0) {
      savePitfalls(pitfalls);
    }

    // 自動備份記憶到 claude-memory repo（只 commit，不 push）
    try {
      const { execSync } = require('child_process');
      const backupScript = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'scripts', 'hooks', 'memory-backup.sh');
      if (fs.existsSync(backupScript)) {
        execSync(`bash "${backupScript}"`, { timeout: 10000, stdio: 'ignore' });
        debugLog('自動備份 commit 完成');
      }
    } catch (backupErr) {
      debugLog(`自動備份失敗（不影響正常結束）: ${backupErr.message}`);
    }

    debugLog('=== session-end 完成 ===');
  } catch (err) {
    debugLog(`主程式錯誤: ${err.message}\n${err.stack}`);
  }
}

// 從 stdin 讀取
let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => main(input));
