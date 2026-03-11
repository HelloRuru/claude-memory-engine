#!/usr/bin/env node
/**
 * UserPromptSubmit Hook — 中繼摘要計數器
 * 每 N 次使用者訊息，自動存一份中繼摘要到 sessions/
 * 解決 SessionEnd 在 VSCode 環境下不可靠的問題
 */

const fs = require('fs');
const path = require('path');

const HOME = process.env.HOME || process.env.USERPROFILE;
const SESSIONS_DIR = path.join(HOME, '.claude', 'sessions');
const STATE_FILE = path.join(SESSIONS_DIR, '.checkpoint-state.json');
const CHECKPOINT_INTERVAL = 20; // 每 20 則訊息存一次

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
    ensureDir(SESSIONS_DIR);
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {}
}

/**
 * 輕量 mini 分析：從訊息中抓出關鍵動作和常見檔案/專案名
 * 設計原則：只用簡單字串比對，不做正規式回溯，避免拖慢 hook
 */
function miniAnalyze(messages) {
  // 動作詞對照表（關鍵字 → 顯示標籤）
  const ACTION_MAP = {
    '部署': '部署', '推推': '部署', '上線': '部署', 'push': '部署', 'deploy': '部署',
    '修': '修改', '改': '修改', 'fix': '修改', 'bug': '除錯',
    '寫': '撰寫', '建': '建立', '新增': '新增', 'create': '建立',
    '測試': '測試', 'test': '測試', 'debug': '除錯',
    '刪': '刪除', '移除': '移除', 'delete': '刪除',
    '設定': '設定', 'config': '設定', '安裝': '安裝', 'install': '安裝',
    '讀取': '讀取', 'RR': '讀取', 'MM': '記憶', '備份': '備份', 'BB': '備份',
    '截圖': '驗證', '確認': '驗證',
  };

  // 常見專案/檔案名稱比對清單
  const PROJECT_KEYWORDS = [
    'ohruru', 'tools', 'lab', 'helloruru', 'happy-exit', 'newday',
    'blog', 'keystatic', 'astro', 'MEMORY', 'CLAUDE.md',
  ];

  const allText = messages.join(' ').toLowerCase();

  // 統計動作詞出現次數
  const actionCounts = {};
  for (const [keyword, label] of Object.entries(ACTION_MAP)) {
    if (allText.includes(keyword.toLowerCase())) {
      actionCounts[label] = (actionCounts[label] || 0) + 1;
    }
  }

  // 依出現次數排序，取前 3 個動作
  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);

  // 統計專案/檔案名出現次數
  const projectCounts = {};
  for (const name of PROJECT_KEYWORDS) {
    const lowerName = name.toLowerCase();
    let count = 0;
    let idx = 0;
    while ((idx = allText.indexOf(lowerName, idx)) !== -1) {
      count++;
      idx += lowerName.length;
    }
    if (count > 0) projectCounts[name] = count;
  }

  // 取最常提到的專案（前 2 個）
  const topProjects = Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);

  // 組一句話摘要
  const actionPart = topActions.length > 0 ? topActions.join('、') : '雜項作業';
  const projectPart = topProjects.length > 0 ? `（${topProjects.join('、')}）` : '';
  const summary = `${actionPart}${projectPart}`;

  return { topActions, topProjects, summary };
}

function saveCheckpoint(sessionId, messages) {
  ensureDir(SESSIONS_DIR);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
  const shortId = sessionId ? sessionId.substring(0, 8) : Math.random().toString(36).substring(2, 6);
  const filename = `${dateStr}-${shortId}-checkpoint.md`;

  // 從訊息中擷取標題
  const titleHint = messages.slice(0, 3).join(' ').replace(/\n/g, ' ').substring(0, 50);

  // 取最近的訊息（最多 10 則）
  const recentMessages = messages.slice(-10);

  // mini 分析：這段期間在做什麼
  const analysis = miniAnalyze(messages);

  const content = `# Checkpoint: ${dateStr}
**標題：** ${titleHint}
**時間：** ${timeStr}
**累計訊息數：** ${messages.length}
**類型：** 中繼摘要（自動，每 ${CHECKPOINT_INTERVAL} 則）

## 這段在做什麼
${analysis.summary}

## 嚕寶的要求（最近 ${recentMessages.length} 則）
${recentMessages.map(m => `- ${m}`).join('\n')}
`;

  fs.writeFileSync(path.join(SESSIONS_DIR, filename), content, 'utf-8');

  // 清理舊的 checkpoint（只保留最近 10 份）
  try {
    const checkpoints = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('-checkpoint.md'))
      .map(f => ({
        name: f,
        path: path.join(SESSIONS_DIR, f),
        mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (checkpoints.length > 10) {
      for (const old of checkpoints.slice(10)) {
        try { fs.unlinkSync(old.path); } catch (e) {}
      }
    }
  } catch (e) {}
}

function main(inputData) {
  try {
    let data;
    try {
      data = JSON.parse(inputData);
    } catch (e) {
      return; // 解析失敗就靜默退出
    }

    const sessionId = data.session_id || 'unknown';
    const prompt = data.prompt || '';

    // 截取前 200 字
    const shortPrompt = prompt.trim().substring(0, 200);
    if (!shortPrompt) return;

    const state = loadState();

    // 用 session_id 分組
    if (!state[sessionId]) {
      state[sessionId] = {
        messages: [],
        lastCheckpoint: 0,
        startTime: new Date().toISOString()
      };
    }

    const session = state[sessionId];
    session.messages.push(shortPrompt);
    session.lastActivity = new Date().toISOString();

    // 檢查是否到了存檔時機
    const messagesSinceCheckpoint = session.messages.length - session.lastCheckpoint;
    if (messagesSinceCheckpoint >= CHECKPOINT_INTERVAL) {
      saveCheckpoint(sessionId, session.messages);
      session.lastCheckpoint = session.messages.length;
    }

    // 清理過舊的 session 紀錄（超過 3 天的）
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    for (const sid of Object.keys(state)) {
      if (sid === sessionId) continue;
      const s = state[sid];
      if (s.lastActivity && new Date(s.lastActivity).getTime() < threeDaysAgo) {
        delete state[sid];
      }
    }

    saveState(state);
  } catch (err) {
    // 靜默失敗，不影響使用者體驗
  }
}

// 從 stdin 讀取
let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => main(input));
