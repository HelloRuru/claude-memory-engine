<h1 align="center">Claude Memory Engine</h1>

<p align="center">
  <strong>Claude Code 的記憶系統，用 hooks 和 markdown 打造。</strong><br>
  沒有資料庫、沒有外部 API、沒有神秘的二進位檔案。<br>
  全部都是你看得懂的 <code>.js</code> 和 <code>.md</code>。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-D4A5A5?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/node-18%2B-B8A9C9?style=flat-square" alt="Node 18+">
  <img src="https://img.shields.io/badge/dependencies-zero-A8B5A0?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/claude_code-hooks-E8B4B8?style=flat-square" alt="Claude Code Hooks">
  <img src="https://img.shields.io/badge/version-1.1-C4B7D7?style=flat-square" alt="v1.1">
</p>

<p align="center">
  <a href="README.md">English</a> &nbsp;|&nbsp; <b>繁體中文</b> &nbsp;|&nbsp; <a href="README.ja.md">日本語</a>
</p>

---

## 痛點

每次開新對話，Claude 都把你忘得一乾二淨。

- 上次花了半小時踩的坑 — 這次又踩了一遍
- 你叫它「記住」什麼 — 下一個 session 全忘了
- 在 A 專案問的問題，切到 B 專案 — 它還以為你在問 A 的事
- Session 越長越糊 — 壓縮之後重要的決策都消失了

---

## :sparkles: v1.1 新功能

| 功能 | 說明 |
| :--- | :--- |
| Smart Context 自動偵測 | 不用再手動設定 `PROJECT_CONTEXT`，自動掃描所有專案的記憶目錄，根據工作目錄配對 |
| 中文糾正偵測 | 踩坑偵測現在認得 13 個中文詞（「不對」「錯了」「改回來」等） |
| `/memory-search` 指令 | 用關鍵字搜尋所有記憶檔案 |
| 踩坑含解法 | 踩坑紀錄現在會自動從對話中抓出解法，不只記錯誤 |
| Session 摘要改版 | 摘要現在包含「做了什麼」主題摘錄，不再只是原始訊息列表 |
| 每週自動週報 | 超過 7 天的 session 自動合併成週報，存到 `sessions/digest/` |

---

## 怎麼解決

Memory Engine 用 **5 個 hooks** 和 **4 個指令** 搞定這些問題。

### :link: Hooks

| Hook | 什麼時候跑 | 做什麼 |
| :--- | :--------- | :----- |
| `session-start` | 每次開新對話 | 自動載入上次的工作摘要 + 根據專案目錄載入對應的記憶 |
| `session-end` | 每次對話結束 | 存下這次做了什麼、改了哪些檔案，同時掃描踩坑紀錄 |
| `memory-sync` | 每次你送訊息 | 偵測記憶檔案有沒有被其他 session 更新，有的話通知變了什麼 |
| `write-guard` | 每次寫入檔案前 | 攔截 `.env`、`credentials` 等敏感檔案，提醒你別推上去 |
| `pre-push-check` | 每次 git push 前 | 檢查 staged 裡有沒有敏感檔案，force push 額外警告 |

### :speech_balloon: 指令

| 指令 | 功能 |
| :--- | :--- |
| `/diary` | 從對話產生反思日記 — 做了什麼、學到什麼、發現什麼規律 |
| `/reflect` | 分析最近的日記和踩坑紀錄，找出重複的模式，提出改善建議 |
| `/memory-health` | 列出所有記憶檔案的行數、更新時間、健康狀態 |
| `/memory-search` | 用關鍵字搜尋所有記憶檔案 |

---

## :package: 安裝

**步驟 1** — 把檔案複製到對應位置：

```bash
# hooks 腳本
cp hooks/*.js ~/.claude/scripts/hooks/

# 指令
cp commands/*.md ~/.claude/commands/

# skill 定義（可選，放了之後 Claude 會自動認得這個 Skill）
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**步驟 2** — 建立必要的目錄：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**步驟 3** — 在 `~/.claude/settings.json` 加入 hooks 設定：

<details>
<summary><strong>點開看完整 hooks 設定</strong></summary>

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

**步驟 4** — 重新啟動 Claude Code。搞定！

---

## :brain: Smart Context：自動載入對應記憶

`session-start.js` 會自動掃描 `~/.claude/projects/` 底下所有專案目錄，根據你的工作目錄（CWD）配對，載入對應的記憶檔案。

不需要任何手動設定，它會自己找到你正在做的專案。

記憶檔案放在 `~/.claude/projects/{project-id}/memory/` 目錄下。

---

## :detective: Auto Learn：踩坑自動學習

`session-end.js` 在每次對話結束時，會自動掃描對話紀錄，偵測四種「踩坑」模式：

| 訊號 | 怎麼判斷 | 例子 |
| :--- | :------ | :--- |
| 重試 3+ 次 | 同一個工具對同一個檔案呼叫 3 次以上 | Edit 同個檔案改了 4 次 |
| 錯誤後修正 | 出現 error 之後，同區域成功了 | build 失敗 -> 改 code -> build 成功 |
| 使用者糾正 | 使用者說「不對」「錯了」「改回來」 | 「不是這個檔案」 |
| 來回修改 | 同一個檔案短時間內被反覆修改 | 改了 CSS 又改回來 |

偵測到的踩坑紀錄會自動存到 `~/.claude/skills/learned/auto-pitfall-{date}.md`，下次開新對話時自動提醒。

v1.1 起，踩坑紀錄會同時包含**解法** — 從同一次對話中自動抓出成功的修正，讓你同時看到問題和答案。

---

## :open_file_folder: 檔案結構

```
claude-memory-engine/
  hooks/
    session-start.js      # 開新對話 -> 載入回憶 + smart-context
    session-end.js        # 對話結束 -> 存摘要 + 踩坑偵測
    memory-sync.js        # 每則訊息 -> 跨 session 記憶同步
    write-guard.js        # 寫入檔案前 -> 敏感檔案警告
    pre-push-check.js     # git push 前 -> 安全檢查
  commands/
    diary.md              # /diary 反思日記
    reflect.md            # /reflect 反思分析
    memory-health.md      # /memory-health 記憶健檢
    memory-search.md      # /memory-search 關鍵字搜尋記憶
  skill/
    SKILL.md              # Skill 定義
    references/
      smart-context.md    # CWD 到記憶檔的對應表
      auto-learn.md       # 踩坑偵測規則
```

---

## :wrench: 客製化

這個 Skill 設計上就是讓你改的。幾個常見的調整：

| 想改什麼 | 去哪裡改 |
| :------- | :------ |
| Smart Context 對應表 | v1.1 自動偵測（通常不需要設定）。可在 `session-start.js` 的 `autoDetectProjectContext()` 調整 |
| 踩坑偵測關鍵字 | `session-end.js` 的 `correctionKeywords` |
| 敏感檔案清單 | `write-guard.js` 的 `PROTECTED_PATTERNS` |
| session 保留數量 | `session-end.js` 的 `MAX_SESSIONS`（預設 30） |

---

## :bulb: 設計理念

**為什麼不用資料庫？**
Markdown 檔案你打開就能讀、能改、能 git commit。不需要裝額外的套件，不需要跑 server，不需要學新的查詢語法。Claude Code 本身就會讀 `.md`，何必多此一舉。

**為什麼不做成 Plugin？**
Plugin 是黑盒子 — 裝了之後你不確定它改了什麼、存了什麼、讀了什麼。Hooks + Commands 是透明的 — 每個 `.js` 你都能打開看，不喜歡就改，覺得多餘就刪。工具應該是你掌控它，不是它掌控你。

---

## :pray: 靈感來源與致謝

這個 Skill 的概念受到三個開源專案啟發。在這裡要特別說清楚：

> **所有程式碼都是從零撰寫，沒有複製、沒有 fork、沒有改寫任何一行來自以下專案的程式碼。**
>
> 我研究了這三個工具各自擅長什麼，把「概念」融合成一套新的實作。就像看了三家餐廳的菜單，然後回家用自己的食材、自己的作法，做了一道新的料理。

| 專案 | 啟發了什麼概念 | 連結 |
| :--- | :------------ | :--- |
| contextstream/claude-code | Smart Context：用 hooks 自動注入相關記憶、踩坑自動學習 | [GitHub](https://github.com/contextstream/claude-code) |
| memvid/claude-brain | 記憶統計、輕量可攜的設計思路 | [GitHub](https://github.com/memvid/claude-brain) |
| rlancemartin/claude-diary | /diary 反思日記、/reflect 反思分析的概念 | [GitHub](https://github.com/rlancemartin/claude-diary) |

感謝這些開發者的分享，讓整個 Claude Code 社群都能互相學習。

---

## 需求

- Claude Code（有 hooks 功能的版本）
- Node.js 18+
- 不需要其他套件（零依賴）

## 授權

MIT -- 詳見 [LICENSE](LICENSE)。

---

<p align="center">
  Made by <a href="https://ohruru.com">HelloRuru</a> — 一個相信工具應該透明、簡單、你看得懂的人。
</p>
