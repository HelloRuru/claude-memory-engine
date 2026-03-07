#!/usr/bin/env node
/**
 * SessionEnd Hook — Memory Engine (Auto Save + Auto Learn)
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

// === 解析 transcript ===
function parseTranscript(transcriptPath) {
  if (!transcriptPath) {
    debugLog('transcript_path 是空的');
    return null;
  }
  if (!fs.existsSync(transcriptPath)) {
    debugLog(`transcript 檔案不存在: ${transcriptPath}`);
    return null;
  }

  const lines = fs.readFileSync(transcriptPath, 'utf-8').trim().split('\n');
  debugLog(`transcript 共 ${lines.length} 行`);

  const userMessages = [];
  const toolsUsed = new Set();
  const filesModified = new Set();
  const toolCalls = []; // 用來偵測踩坑

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // 擷取使用者訊息
      if (entry.role === 'user' && entry.content) {
        const text = typeof entry.content === 'string'
          ? entry.content
          : Array.isArray(entry.content)
            ? entry.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
            : '';
        if (text.trim()) {
          userMessages.push(text.trim().substring(0, 200));
        }
      }

      // 擷取工具呼叫和結果
      if (entry.role === 'assistant' && Array.isArray(entry.content)) {
        for (const block of entry.content) {
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
      // 跳過None法解析的行
    }
  }

  return { userMessages, toolsUsed: [...toolsUsed], filesModified: [...filesModified], toolCalls };
}

// === 踩坑偵測 ===
function detectPitfalls(parsed) {
  if (!parsed || !parsed.toolCalls) return [];
  const pitfalls = [];

  // 訊號 1：重試 3+ 次
  const retryMap = new Map();
  for (const call of parsed.toolCalls) {
    const key = `${call.name}:${call.target}`;
    retryMap.set(key, (retryMap.get(key) || 0) + 1);
  }
  for (const [key, count] of retryMap) {
    if (count >= 3) {
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

  // 訊號 3：使用者糾正
  const correctionKeywords = ['wrong', 'not this', 'revert', 'undo', 'that's not', 'go back', 'not what I'];
  for (const msg of parsed.userMessages) {
    if (correctionKeywords.some(kw => msg.includes(kw))) {
      pitfalls.push({
        type: 'user-correction',
        description: `User correction：${msg.substring(0, 80)}`,
        target: '',
      });
    }
  }

  return pitfalls;
}

// === 存Pitfall Record ===
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

  const content = `# Pitfall Record ${new Date().toISOString().split('T')[0]}

## Issues Detected

${pitfalls.map(p => `### ${p.type}
- ${p.description}
${p.errorSnippet ? `- Error snippet：\`${p.errorSnippet}\`` : ''}`).join('\n\n')}

## Lessons

（下次 session 開始時，Memory Engine會讀取這份紀錄並提醒自己）
`;

  fs.writeFileSync(path.join(LEARNED_DIR, filename), content, 'utf-8');
  debugLog(`Pitfall saved：${filename}（${pitfalls.length} 項）`);
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

    const summary = `# Session: ${dateStr}
**Time:** ${timeStr}
**Messages:** ${parsed.userMessages.length}

## User Requests
${recentMessages.map(m => `- ${m}`).join('\n')}

## Tools Used
${parsed.toolsUsed.join(', ') || 'None'}

## Files Modified
${parsed.filesModified.length > 0 ? parsed.filesModified.map(f => `- ${f}`).join('\n') : 'None'}
`;

    fs.writeFileSync(path.join(SESSIONS_DIR, filename), summary, 'utf-8');
    debugLog(`session 摘要已存: ${filename}`);

    // 踩坑偵測
    const pitfalls = detectPitfalls(parsed);
    debugLog(`踩坑偵測結果: ${pitfalls.length} 項`);
    if (pitfalls.length > 0) {
      savePitfalls(pitfalls);
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
