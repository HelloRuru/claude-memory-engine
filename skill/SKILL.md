---
name: memory-engine
description: 小八的記憶管理系統 — 融合 contextstream、claude-brain、claude-diary 三家精華，統一管理 MM/TT/BB/SS 指令和自動學習。當嚕寶說「記憶健檢」「寫日記」「反思」或使用 MM/BB/SS 指令時觸發。不要用於一般程式開發或前端問題（那些走各專案踩坑 Skill）。
---

# Memory Engine（記憶引擎）

融合三個開源工具的精華，為嚕寶量身打造的記憶管理系統。

## 融合來源

| 來源 | 取了什麼 | 沒取什麼（原因） |
|------|---------|-----------------|
| contextstream | smart-context 自動載入、auto-learn 踩坑學習 | 整套 plugin 安裝（跟現有 hooks 衝突） |
| claude-brain | 記憶統計、快速索引概念 | .mv2 二進位格式（嚕寶看不懂） |
| claude-diary | /diary 日記、/reflect 反思分析 | PreCompact hook（目前 session 不夠長不需要） |

## 五大功能模組

### 1. Smart Context（智慧記憶載入）— from contextstream

根據 CWD 自動判斷專案，載入對應記憶。
- 對應表：`references/smart-context.md`
- 實作：`~/.claude/scripts/hooks/session-start.js`

### 2. Auto Learn（踩坑自動學習）— from contextstream

Session 結束時偵測踩坑模式，自動存到 `learned/`。
- 偵測規則：`references/auto-learn.md`
- 實作：`~/.claude/scripts/hooks/session-end.js`

### 3. Diary + Reflect（反思日記）— from claude-diary

手動觸發，從對話中產生日記和反思分析。
- `/diary` — 寫日記：`~/.claude/commands/diary.md`
- `/reflect` — 反思分析：`~/.claude/commands/reflect.md`
- 日記存放：`~/.claude/sessions/diary/`

### 4. Memory Health（記憶健檢）— from claude-brain

檢視所有記憶檔的健康狀態。
- `/memory-health` — 健檢指令：`~/.claude/commands/memory-health.md`
- 也可用「記憶健檢」觸發

### 5. 原生指令整合

| 嚕寶說 | 指令 | 功能 |
|--------|------|------|
| MM / 記一下 | 存記憶 | 更新 MEMORY.md 或 memory/*.md |
| TT / 待辦 | 看待辦 | 列出待辦清單 |
| BB / 備份 | 推記憶 | git push 到 GitHub claude-memory |
| SS / 同步 | 同步 | 備份 + 從 GitHub 拉最新 |
| 想起來 | 記憶恢復 | 備份 + 讀 GitHub + 確認設定 |

## Hooks 架構

| Hook 類型 | 檔案 | 功能 |
|-----------|------|------|
| SessionStart | session-start.js | smart-context + session 回憶 + 踩坑回顧 + /reflect 提醒 + 重複踩坑內化提醒 |
| SessionEnd | session-end.js | session 摘要存檔 + auto-learn 踩坑偵測 + project tag + 串連索引 |
| UserPromptSubmit | memory-sync.js | 跨 session 記憶變更偵測 + 摘要注入 |
| UserPromptSubmit | mid-session-checkpoint.js | 每 20 則訊息自動存中繼摘要（含 mini 分析） |
| PreToolUse(Write) | write-guard.js | 敏感檔案寫入警告 |
| PreToolUse(Bash) | pre-push-check.js | git push 前安全檢查 |
| PostToolUse(Bash) | zhenhuan-stderr.js | 甄嬛後宮彩蛋 |

## 檔案結構

```
~/.claude/
  scripts/hooks/
    session-start.js    -- smart-context + 回憶載入
    session-end.js      -- 摘要存檔 + 踩坑偵測
    memory-sync.js      -- 跨 session 同步
    write-guard.js      -- 寫入防護
    pre-push-check.js   -- push 防護
  sessions/
    {date}-{id}-session.md  -- session 摘要
    diary/                   -- 反思日記
    debug.log               -- hook debug 紀錄
  commands/
    diary.md            -- /diary 指令
    reflect.md          -- /reflect 指令
    memory-health.md    -- /memory-health 指令
  skills/learned/memory-engine/
    SKILL.md            -- 本檔案
    references/
      smart-context.md  -- CWD 對應表
      auto-learn.md     -- 踩坑偵測規則
```

## 觸發詞

- 記憶健檢 → `/memory-health`
- 寫日記 → `/diary`
- 反思 → `/reflect`
- MM / 記一下 → 存記憶
- BB / 備份 → 推到 GitHub
- SS / 同步 → 備份 + 拉最新
- 想起來 → 記憶恢復

## References

- `references/smart-context.md` — CWD 到記憶檔的對應表
- `references/auto-learn.md` — 踩坑偵測規則 + 自動學習流程

## 核心原則

### 建了東西要確認它活著
- 建好任何 hook / 功能後，一定要跑測試確認它真的能動
- 不要相信「寫好了 = 完成了」，要看到實際輸出才算
- v1.3 教訓：SessionEnd hook 從建立就沒正確跑過，transcript 格式對不上，四天後才發現

### 樹狀架構四問（/reflect 步驟 5 的決策邏輯）
- Q1 是否要長？→ 不服務主幹就剪
- Q2 成長（濃縮取代）？→ 精煉版取代原始版
- Q3 融會貫通？→ 已有原則涵蓋的不重複記
- Q4 清是最後防線 → Q1-Q3 都不適用才清除

### 濃縮 = 取代 = 清理
- 不需要獨立的清理機制。精煉版寫好了，原始版自然被取代
- 消化不是縮小，是展開。每次整理都重新消化、產生新資料

## Troubleshooting

### MEMORY.md 超過 200 行但沒被警告
- **原因**：寫入前沒先數行數
- **解法**：每次寫入前跑 `wc -l`，超過 170 行就先搬家到獨立檔案

### MM 存了但下個 session 不知道
- **原因**：存到了 MEMORY.md 直接塞內容，沒建 HOOK 指標
- **解法**：MEMORY.md 只放 HOOK，細節放 `memory/*.md`

### BB 推不上去
- **原因**：claude-memory repo 有衝突或認證過期
- **解法**：先 `git pull`，有衝突問嚕寶決定保留哪邊
