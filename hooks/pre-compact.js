#!/usr/bin/env node
/**
 * PreCompact Hook — 壓縮前快照（真正的安全網）
 *
 * 現實中大部分對話不會正式結束（沒人打 /exit）。
 * Context 滿了 → 自動壓縮 → 繼續對話，這才是常態。
 * 所以 PreCompact 比 SessionEnd 更常觸發，才是真正該做存檔的地方。
 *
 * 做的事跟 SessionEnd 一樣：
 * 1. 存這一段的工作摘要
 * 2. 偵測踩坑模式
 * 3. 更新專案索引
 * 4. 自動備份 commit
 *
 * 觸發時機：
 * - auto：context 滿了自動壓縮（最重要）
 * - manual：使用者手動 /compact
 *
 * 輸入（stdin JSON）：
 * { session_id, transcript_path, hook_event_name, trigger, custom_instructions }
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

function debugLog(msg) {
  ensureDir(SESSIONS_DIR);
  const ts = new Date().toISOString();
  fs.appendFileSync(DEBUG_LOG, `[${ts}] [pre-compact] ${msg}\n`, 'utf-8');
}

// === 尋找 fallback transcript ===
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

  if (bestFile && (Date.now() - bestMtime) < 10 * 60 * 1000) {
    return bestFile;
  }
  return null;
}

// === 專案歸屬偵測 ===
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
  ];

  const cwd = (inputCwd || process.cwd()).replace(/\\/g, '/');
  for (const { pattern, tag } of projectPatterns) {
    if (pattern.test(cwd)) return tag;
  }

  if (filesModified && filesModified.length > 0) {
    const allPaths = filesModified.join(' ');
    for (const { pattern, tag } of projectPatterns) {
      if (pattern.test(allPaths)) return tag;
    }
  }

  const allText = (userMessages || []).slice(0, 10).join(' ');
  for (const { pattern, tag } of projectPatterns) {
    if (pattern.test(allText)) return tag;
  }

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
    debugLog('transcript_path is empty');
    return null;
  }

  let actualPath = transcriptPath;
  if (!fs.existsSync(transcriptPath)) {
    debugLog(`transcript not found: ${transcriptPath}, trying fallback...`);
    actualPath = findFallbackTranscript(transcriptPath);
    if (!actualPath) {
      debugLog('fallback also failed');
      return null;
    }
    debugLog(`fallback found: ${actualPath}`);
  }

  const lines = fs.readFileSync(actualPath, 'utf-8').trim().split('\n');
  debugLog(`transcript has ${lines.length} lines`);

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

      if (entryType === 'user' && msg.content) {
        const content = msg.content;
        const text = typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content.filter(c => c.type === 'text').map(c => c.text).join(' ')
            : '';
        const cleaned = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
                           .replace(/<ide_[\s\S]*?>/g, '')
                           .replace(/^The user opened the file[\s\S]*?$/gm, '')
                           .replace(/<available-deferred-tools>[\s\S]*?<\/available-deferred-tools>/g, '')
                           .trim();
        if (cleaned && cleaned.length > 0 && !cleaned.startsWith('<') && !cleaned.startsWith('The user') && !cleaned.startsWith('This session is being continued')) {
          userMessages.push(cleaned.substring(0, 200));
        }
      }

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

// === 踩坑偵測 ===
function detectPitfalls(parsed) {
  if (!parsed || !parsed.toolCalls) return [];
  const pitfalls = [];

  const normalRepeatTools = new Set(['TodoWrite', 'Agent', 'Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch']);

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

  return pitfalls;
}

// === 存踩坑紀錄 ===
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

// === 更新專案索引 ===
function updateProjectIndex(projectTag, dateStr, timeStr, titleHint, filename) {
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
    const newEntry = `- ${dateStr} ${timeStr} | [compact] ${titleHint} | ${filename}`;
    entries.push(newEntry);

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

// === 自動備份 commit ===
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

// === 主程式 ===
function main(inputData) {
  debugLog('=== pre-compact started ===');

  try {
    let data;
    try {
      data = JSON.parse(inputData);
    } catch (parseErr) {
      debugLog(`JSON parse failed: ${parseErr.message}`);
      return;
    }

    const trigger = data.trigger || 'unknown'; // "auto" or "manual"
    const transcriptPath = data.transcript_path;
    debugLog(`trigger: ${trigger}, transcript: ${transcriptPath}`);

    const parsed = parseTranscript(transcriptPath);
    if (!parsed) {
      debugLog('parseTranscript returned null');
      return;
    }

    if (parsed.userMessages.length === 0) {
      debugLog('no user messages, skipping');
      return;
    }

    debugLog(`messages: ${parsed.userMessages.length}, tools: ${parsed.toolsUsed.join(',')}, files: ${parsed.filesModified.join(',')}`);

    // === 存壓縮前快照 ===
    ensureDir(SESSIONS_DIR);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const shortId = (data.session_id || '').substring(0, 8) || Math.random().toString(36).substring(2, 6);
    const filename = `${dateStr}-${shortId}-compact.md`;

    const projectTag = detectProjectTag(parsed.userMessages, data.cwd, parsed.filesModified);
    debugLog(`project: ${projectTag}`);

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
    debugLog(`compact snapshot saved: ${filename}`);

    // === 更新專案索引 ===
    updateProjectIndex(projectTag, dateStr, timeStr, titleHint, filename);

    // === 踩坑偵測 ===
    const pitfalls = detectPitfalls(parsed);
    debugLog(`pitfalls detected: ${pitfalls.length}`);
    if (pitfalls.length > 0) {
      savePitfalls(pitfalls);
    }

    // === 自動備份 commit ===
    autoBackup();

    debugLog('=== pre-compact done ===');
  } catch (err) {
    debugLog(`error: ${err.message}\n${err.stack}`);
  }
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => main(input));
