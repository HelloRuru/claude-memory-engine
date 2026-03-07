# Claude Memory Engine

> [English](README.md) | **繁體中文** | [日本語](README.ja.md)

> 每次開新對話，Claude 都把你忘得一乾二淨。
> 這個 Skill 讓它記得 — 不只記得上次做了什麼，還會從錯誤裡學習。

Claude Code 的記憶系統，用 hooks 和 markdown 打造。沒有資料庫、沒有外部 API、沒有神秘的二進位檔案 — 全部都是你看得懂的 `.js` 和 `.md`。

## 這個 Skill 做了什麼

打開 Claude Code，你通常會遇到這些事：

- 上次花了半小時踩的坑，這次又踩了一遍
- 你叫它「記住」什麼，下一個 session 全部忘記
- 在 A 專案問的問題，切到 B 專案它還以為你在問 A 的事
- Session 越長越糊，壓縮之後重要的決策都消失了

Memory Engine 用 5 個 hooks 解決這些問題：

| Hook | 什麼時候跑 | 做什麼 |
| ---- | --------- | ------ |
| session-start | 每次開新對話 | 自動載入上次的工作摘要 + 根據你在哪個專案目錄，載入對應的記憶 |
| session-end | 每次對話結束 | 自動存下這次做了什麼、改了哪些檔案，同時掃描對話找出踩坑紀錄 |
| memory-sync | 每次你送訊息 | 偵測記憶檔案有沒有被其他 session 更新，有的話通知 Claude 變了什麼 |
| write-guard | 每次寫入檔案前 | 攔截 `.env`、`credentials` 等敏感檔案，提醒你別推上去 |
| pre-push-check | 每次 git push 前 | 檢查 staged 裡有沒有敏感檔案，force push 額外警告 |

加上 3 個指令：

| 指令 | 功能 |
| ---- | ---- |
| `/diary` | 從這次對話產生反思日記 — 做了什麼、學到什麼、發現什麼規律 |
| `/reflect` | 分析最近的日記和踩坑紀錄，找出重複的模式，提出改善建議 |
| `/memory-health` | 列出所有記憶檔案的行數、更新時間、健康狀態 |

## 安裝

1. 把檔案複製到對應位置：

```bash
# hooks 腳本
cp hooks/*.js ~/.claude/scripts/hooks/

# 指令
cp commands/*.md ~/.claude/commands/

# skill 定義（可選，放了之後 Claude 會自動認得這個 Skill）
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

2. 在 `~/.claude/settings.json` 加入 hooks 設定：

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

3. 建立必要的目錄：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

4. 重新啟動 Claude Code。

## Smart Context：自動載入對應記憶

`session-start.js` 會根據你的工作目錄（CWD），自動判斷你在哪個專案，載入對應的記憶檔案。

要自訂對應表，編輯 `session-start.js` 裡的 `PROJECT_CONTEXT` 陣列：

```javascript
const PROJECT_CONTEXT = [
  {
    keywords: ['my-project'],       // CWD 包含這些關鍵字
    name: '我的專案',                // 顯示名稱
    files: ['project-notes.md'],    // 要載入的記憶檔案
  },
];
```

記憶檔案放在 `~/.claude/projects/{project-id}/memory/` 目錄下。

## Auto Learn：踩坑自動學習

`session-end.js` 在每次對話結束時，會自動掃描對話紀錄，偵測四種「踩坑」模式：

| 訊號 | 怎麼判斷 | 例子 |
| ---- | ------- | ---- |
| 重試 3+ 次 | 同一個工具對同一個檔案呼叫 3 次以上 | Edit 同個檔案改了 4 次 |
| 錯誤後修正 | 出現 error 之後，同區域成功了 | build 失敗 -> 改 code -> build 成功 |
| 使用者糾正 | 使用者說「不對」「錯了」「改回來」 | 「不是這個檔案」 |
| 來回修改 | 同一個檔案短時間內被反覆修改 | 改了 CSS 又改回來 |

偵測到的踩坑紀錄會自動存到 `~/.claude/skills/learned/auto-pitfall-{date}.md`，下次開新對話時 `session-start.js` 會自動提醒。

## 檔案結構

```
claude-memory-engine/
  hooks/
    session-start.js    # 開新對話 -> 載入回憶 + smart-context
    session-end.js      # 對話結束 -> 存摘要 + 踩坑偵測
    memory-sync.js      # 每則訊息 -> 跨 session 記憶同步
    write-guard.js      # 寫入檔案前 -> 敏感檔案警告
    pre-push-check.js   # git push 前 -> 安全檢查
  commands/
    diary.md            # /diary 反思日記
    reflect.md          # /reflect 反思分析
    memory-health.md    # /memory-health 記憶健檢
  skill/
    SKILL.md            # Skill 定義
    references/
      smart-context.md  # CWD 到記憶檔的對應表
      auto-learn.md     # 踩坑偵測規則
```

## 客製化

這個 Skill 設計上就是讓你改的。幾個常見的調整：

- **改 Smart Context 對應表**：編輯 `session-start.js` 的 `PROJECT_CONTEXT`
- **改踩坑偵測關鍵字**：編輯 `session-end.js` 的 `correctionKeywords`
- **改敏感檔案清單**：編輯 `write-guard.js` 的 `PROTECTED_PATTERNS`
- **改 session 保留數量**：編輯 `session-end.js` 的 `MAX_SESSIONS`（預設 30）

## 設計理念

### 為什麼不用資料庫？

Markdown 檔案你打開就能讀、能改、能 git commit。
不需要裝額外的套件，不需要跑 server，不需要學新的查詢語法。
Claude Code 本身就會讀 `.md`，何必多此一舉。

### 為什麼不做成 Plugin？

Plugin 是黑盒子 — 裝了之後你不確定它改了什麼、存了什麼、讀了什麼。
Hooks + Commands 是透明的 — 每個 `.js` 你都能打開看，不喜歡就改，覺得多餘就刪。
對我來說，工具應該是你掌控它，不是它掌控你。

## 靈感來源與致謝

這個 Skill 的概念受到三個開源專案啟發。在這裡要特別說清楚：

**所有程式碼都是從零撰寫，沒有複製、沒有 fork、沒有改寫任何一行來自以下專案的程式碼。**

我研究了這三個工具各自擅長什麼，把「概念」融合成一套新的實作。就像看了三家餐廳的菜單，然後回家用自己的食材、自己的作法，做了一道新的料理。

| 專案 | 啟發了什麼概念 | 連結 |
| ---- | ------------- | ---- |
| [contextstream/claude-code](https://github.com/contextstream/claude-code) | Smart Context：用 hooks 自動注入相關記憶、踩坑自動學習 | contextstream |
| [memvid/claude-brain](https://github.com/memvid/claude-brain) | 記憶統計、輕量可攜的設計思路 | memvid |
| [rlancemartin/claude-diary](https://github.com/rlancemartin/claude-diary) | /diary 反思日記、/reflect 反思分析的概念 | rlancemartin (MIT License) |

感謝這些開發者的分享，讓整個 Claude Code 社群都能互相學習。

## 需求

- Claude Code（有 hooks 功能的版本）
- Node.js 18+
- 不需要其他套件（零依賴）

## 授權

MIT License

---

Made by [HelloRuru](https://ohruru.com) — 一個相信工具應該透明、簡單、你看得懂的人。
