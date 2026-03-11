<h1 align="center">Claude Memory Engine</h1>

<p align="center">
  <strong>不只是記憶，而是懂得學習。</strong><br>
  學習不犯同樣的問題，學習如何進步。<br>
  AI 也像個學生，適合自己一再迴圈成長。
</p>

<p align="center">
  用 hooks 和 markdown 打造，沒有資料庫、沒有外部 API。<br>
  只有程式碼和文件。什麼都不藏。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-D4A5A5?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/node-18%2B-B8A9C9?style=flat-square" alt="Node 18+">
  <img src="https://img.shields.io/badge/dependencies-zero-A8B5A0?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/claude_code-hooks-E8B4B8?style=flat-square" alt="Claude Code Hooks">
  <img src="https://img.shields.io/badge/version-1.3-C4B7D7?style=flat-square" alt="v1.3">
</p>

<p align="center">
  <a href="README.md">English</a> &nbsp;|&nbsp; <b>繁體中文</b> &nbsp;|&nbsp; <a href="README.ja.md">日本語</a>
</p>

---

## WHAT — 每次開新對話，Claude 都從零開始

- 上次花半小時踩的坑 — 這次又踩了一遍
- 你教它的偏好、專案規則 — 下個 session 全部重來
- 在 A 專案的上下文切到 B — 它分不清誰是誰
- 對話越長越糊 — 壓縮之後重要的決策都消失了
- 記憶檔案越來越多 — 沒人整理，越堆越亂
- 電腦壞了 — 本地記憶全部不見，沒有備份

記憶工具可以幫它「記住」。但記住不等於學會。

---

## WHY — 因為它會學

Memory Engine 不只幫 Claude 記東西，還讓它像學生一樣學習：

- 踩過的坑不會再踩第二次 — 它自己記住問題和解法
- 切專案時不用重新教 — 它知道你現在在做什麼
- 用越久越順手 — 每一圈都比上一圈更懂你
- 你看得見它怎麼學的 — 全部都是 markdown 和 JS，沒有黑盒子

---

## HOW — 透過學生迴圈

- **學生迴圈（Student Loop）** — 8 步學習循環，像大考複習一樣持續進步
- **智慧載入（Smart Context）** — 根據工作目錄自動載入對應專案的記憶
- **自動學習（Auto Learn）** — 踩坑時自動記錄問題和解法，下次不再犯

### :brain: 學生迴圈

> 像是大考複習。我讓 Claude Code 試著當個準備期末考的學生 — 每堂課後抄筆記、整理分類、複習找規律、建錯題本、期末總複習。每跑一圈，它就更懂你一點。

**上課（自動，每次對話都在跑）**

每次對話結束，Claude 自動做三件事：

1. **抄筆記** — 記下做了什麼、改了哪些檔案、關鍵決策
2. **串連** — 標記屬於哪個專案，跟之前的筆記連起來
3. **找規律** — 掃描對話，偵測踩坑模式（重試 5 次、出錯後修正、使用者糾正、來回修改）

每 20 則訊息還會自動存一份中繼紀錄，不怕對話太長、壓縮後遺失。

**期末總複習（手動，用 `/反思` 觸發）**

累積幾天的筆記後，跑一次 `/反思`：

4. **回顧整理** — 讀最近 7 天的筆記和踩坑紀錄，標記有效或過時
5. **精煉** — 四問決策：要留嗎？→ 能濃縮？→ 已有規則涵蓋？→ 清除是最後手段
6. **再學一遍** — 用整理過的資料重新分析，找出重複模式
7. **瘦身** — 列出可清除的項目，你確認後才刪
8. **收尾** — 產出報告：學到什麼、改了什麼、下一圈注意什麼

> 不是跑一次就好。每跑一圈，筆記更精煉、規律更清楚、踩坑更少。

### :detective: 智慧載入（Smart Context）+ 自動學習（Auto Learn）

**智慧載入** — 你在哪個資料夾工作，它就自動載入那個專案的記憶。不用設定。

**自動學習** — 踩了坑又解決了，它自動記下問題和解法，下次開新對話時提醒自己。同一種錯跨天出現 3 次以上，還會建議寫進長期規則。

### :link: 日常工具

| 能力 | 說明 |
| :--- | :--- |
| 健檢 | `/健檢` 日常掃描 + `/大健檢` 每週稽核，確保記憶系統健康 |
| 待辦 | `/待辦` 追蹤所有專案的未完成項目 |
| 備份 | `/備份` `/同步` 對接 GitHub，雙向同步，電腦壞了也不怕 |
| 還原 | `/想起來` 從 GitHub 備份還原遺失的記憶 |
| 搜尋 | `/搜尋記憶` 用關鍵字搜尋所有記憶檔案 |
| 雙語 | 每個指令都有英文 + 繁體中文版（28 個檔案） |

<details>
<summary><strong>完整指令列表</strong></summary>

**日常操作**

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/存記憶` | `/save` | 跨 session 存記憶 — 自動去重複、分類歸檔 |
| `/讀取` | `/reload` | 把記憶完整載入目前對話 |
| `/待辦` | `/todo` | 跨專案待辦追蹤 |
| `/備份` | `/backup` | 把本地記憶推到 GitHub |
| `/同步` | `/sync` | 雙向同步 — 推本地、拉遠端 |

**反思與學習**

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/回顧` | `/diary` | 產生反思日記 |
| `/反思` | `/reflect` | 分析踩坑紀錄，找出重複模式 |
| `/學習` | `/learn` | 手動存踩坑經驗 |

**健檢**

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/健檢` | `/check` | 小健檢 — 容量、斷鏈、孤兒檔案 |
| `/大健檢` | `/full-check` | 完整稽核 — 指令層、Git repo、環境設定 |
| `/記憶健檢` | `/memory-health` | 記憶檔案行數、更新日期、容量警告 |

**搜尋與維護**

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/搜尋記憶` | `/memory-search` | 關鍵字搜尋所有記憶檔案 |
| `/想起來` | `/recover` | 從 GitHub 備份還原 |
| `/壓縮建議` | `/compact-guide` | 什麼時候該壓縮的判斷指南 |

</details>

<details>
<summary><strong>7 個 Hooks（全部自動執行）</strong></summary>

| Hook | 觸發時機 | 做什麼 |
| :--- | :------- | :----- |
| `session-start` | 開新對話 | 載入上次摘要 + 專案記憶 |
| `session-end` | 對話結束 | 存摘要 + 踩坑偵測 |
| `memory-sync` | 每次送訊息 | 偵測跨 session 記憶變更 |
| `write-guard` | 寫入檔案前 | 敏感檔案攔截 |
| `pre-push-check` | git push 前 | 安全檢查 |
| `mid-session-checkpoint` | 每 20 則訊息 | 存中繼紀錄 + mini 分析 |

</details>

---

## :package: 安裝

**步驟 1** — 建立記憶備份用的 GitHub repo：

> 沒有備份 repo，`/備份`、`/同步`、`/想起來` 都沒辦法用。記憶只存在本地，電腦壞了就全沒了。

```bash
gh repo create claude-memory --private
git clone https://github.com/你的帳號/claude-memory.git ~/.claude/claude-memory
```

**步驟 2** — 複製檔案：

```bash
cp hooks/*.js ~/.claude/scripts/hooks/
cp commands/*.md ~/.claude/commands/
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**步驟 3** — 建立目錄：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**步驟 4** — 在 `~/.claude/settings.json` 加入 hooks 設定：

<details>
<summary><strong>點開看完整設定</strong></summary>

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/session-start.js"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/session-end.js"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/memory-sync.js"
          },
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/mid-session-checkpoint.js"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/pre-push-check.js"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/write-guard.js"
          }
        ]
      }
    ]
  }
}
```

</details>

**步驟 5** — 重新啟動 Claude Code。搞定！

---

## :wrench: 客製化

| 想改什麼 | 去哪裡改 |
| :------- | :------ |
| 對應表 | Smart Context v1.1 自動偵測（通常不用設定），可在 `session-start.js` 調整 |
| 踩坑關鍵字 | `session-end.js` 的 `correctionKeywords` |
| 敏感檔案 | `write-guard.js` 的 `PROTECTED_PATTERNS` |
| 保留數量 | `session-end.js` 的 `MAX_SESSIONS`（預設 30） |

---

## :bulb: 設計理念

**為什麼不用資料庫？**
Markdown 你打開就能讀、能改、能 git commit。Claude Code 本身就會讀 `.md`，何必多此一舉。

**為什麼不做成 Plugin？**
Plugin 是黑盒子。Hooks + Commands 是透明的 — 每個 `.js` 你都能打開看，不喜歡就改，覺得多餘就刪。工具應該是你掌控它，不是它掌控你。

---

## :pray: 靈感來源

> **所有程式碼從零撰寫，沒有複製、fork 或改寫任何來源專案的程式碼。**

| 專案 | 啟發了什麼 |
| :--- | :-------- |
| [contextstream/claude-code](https://github.com/contextstream/claude-code) | Smart Context、踩坑自動學習 |
| [memvid/claude-brain](https://github.com/memvid/claude-brain) | 記憶統計、輕量設計 |
| [rlancemartin/claude-diary](https://github.com/rlancemartin/claude-diary) | 反思日記、規律分析 |

---

<details>
<summary><strong>版本紀錄</strong></summary>

**v1.3 — 學生迴圈**
- 八步學習循環（前 3 步自動、後 5 步 `/反思` 觸發）
- 中繼摘要（每 20 則訊息）
- `/反思` 樹狀四問決策
- SessionEnd 修正（transcript 解析、IDE 雜訊過濾、踩坑門檻調高到 5）

**v1.2 — 完整指令集**
- 14 個雙語指令（日常操作 / 反思學習 / 健檢 / 搜尋恢復）
- 兩階段健檢（`/健檢` + `/大健檢`）
- 跨專案待辦、備份同步、緊急還原、壓縮建議

**v1.1 — Smart Context 自動偵測**
- 不用手動設定，自動掃描專案記憶目錄
- 中文糾正偵測（13 個中文詞）
- 踩坑紀錄含解法、Session 摘要改版、每週自動週報

</details>

<details>
<summary><strong>檔案結構</strong></summary>

```
claude-memory-engine/
  hooks/
    session-start.js          # 開新對話 -> 載入回憶 + smart-context
    session-end.js            # 對話結束 -> 存摘要 + 踩坑偵測
    memory-sync.js            # 每則訊息 -> 跨 session 記憶同步
    write-guard.js            # 寫入檔案前 -> 敏感檔案警告
    pre-push-check.js         # git push 前 -> 安全檢查
    mid-session-checkpoint.js # 每 20 則訊息 -> 中繼紀錄
  commands/
    save.md / 存記憶.md        # 跨 session 存記憶
    reload.md / 讀取.md        # 讀取記憶
    todo.md / 待辦.md          # 跨專案待辦
    backup.md / 備份.md        # 推到 GitHub
    sync.md / 同步.md          # 雙向同步
    diary.md / 回顧.md         # 反思日記
    reflect.md / 反思.md       # 規律分析
    learn.md / 學習.md         # 踩坑學習
    check.md / 健檢.md         # 小健檢
    full-check.md / 大健檢.md   # 完整稽核
    memory-health.md / 記憶健檢.md
    memory-search.md / 搜尋記憶.md
    recover.md / 想起來.md
    compact-guide.md / 壓縮建議.md
  skill/
    SKILL.md
    references/
      smart-context.md
      auto-learn.md
```

</details>

---

## 需求

- Claude Code（有 hooks 功能的版本）
- Node.js 18+
- 零依賴

## 授權

MIT -- 詳見 [LICENSE](LICENSE)。

---

<p align="center">
  Made by <a href="https://ohruru.com">HelloRuru</a> — 一個相信工具應該透明、簡單、你看得懂的人。
</p>
