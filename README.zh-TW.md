<h1 align="center">Claude Memory Engine</h1>

<p align="center">
  <strong>Claude Code 的記憶系統，用 hooks 和 markdown 打造。</strong><br>
  沒有資料庫、沒有外部 API、沒有神秘的二進位檔案。<br>
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

## 痛點

每次開新對話，Claude 都把你忘得一乾二淨。

- 上次花了半小時踩的坑 — 這次又踩了一遍
- 你叫它「記住」什麼 — 下一個 session 全忘了
- 在 A 專案問的問題，切到 B 專案 — 它還以為你在問 A 的事
- Session 越長越糊 — 壓縮之後重要的決策都消失了

---

## :sparkles: v1.3 新功能：學生迴圈

> 像是大考複習。我讓 Claude Code 試著當個準備期末考的學生 — 每堂課後抄筆記、整理分類、複習找規律、建錯題本、期末總複習。每跑一圈，它就更懂你一點。

| 功能 | 說明 |
| :--- | :--- |
| 學習迴圈（8 步） | 自動記筆記（SessionEnd）→ 串連同專案 → 找規律 → 回顧整理 → 精煉資料 → 用精煉版再學 → 瘦身 → 收尾。前 3 步自動，後 5 步用 `/反思` 觸發 |
| 中繼摘要 | 每 20 則訊息自動存一份中繼紀錄，附帶 mini 分析（這段在做什麼、碰了哪個專案） |
| `/反思` 自動提醒 | 開新對話時檢查上次跑 `/反思` 是什麼時候，超過 7 天就提醒 |
| 重複踩坑提醒 | 同一種錯跨天出現 3 次以上？開對話時主動建議寫進長期規則 |
| 樹狀四問決策 | `/反思` 步驟 5 改用四問判斷：要長嗎？→ 能濃縮嗎？→ 已有規則涵蓋？→ 清除是最後手段 |
| SessionEnd 修正 | 修好從 v1.0 就壞掉的 transcript 解析器、加 IDE 雜訊過濾、5 層 project tag 偵測、踩坑門檻調高到 5 |

<details>
<summary>v1.2 變更</summary>

| 功能 | 說明 |
| :--- | :--- |
| 14 個指令（原本 4 個） | 完整指令集：日常操作、健檢、備份、學習、待辦追蹤 |
| 雙語指令 | 每個指令都有英文 + 中文版（共 28 個檔案） |
| `/健檢` + `/大健檢` | 兩階段健檢 — 日常快速掃描 + 每週完整稽核 |
| `/存記憶` `/讀取` `/同步` | 記憶操作的快捷指令（從日常工作流整理出來的） |
| `/學習` | 踩坑自動學習的獨立指令 |
| `/待辦` | 跨專案待辦追蹤 |
| `/想起來` | 記憶不見時的緊急還原 |
| `/壓縮建議` | 什麼時候該壓縮、什麼時候不該的判斷指南 |

</details>

<details>
<summary>v1.1 變更</summary>

| 功能 | 說明 |
| :--- | :--- |
| Smart Context 自動偵測 | 不用再手動設定 `PROJECT_CONTEXT`，自動掃描所有專案的記憶目錄 |
| 中文糾正偵測 | 踩坑偵測認得 13 個中文詞 |
| `/搜尋記憶` 指令 | 用關鍵字搜尋所有記憶檔案 |
| 踩坑含解法 | 踩坑紀錄自動從對話中抓出解法 |
| Session 摘要改版 | 包含「做了什麼」主題摘錄 |
| 每週自動週報 | 超過 7 天的 session 自動合併成週報 |

</details>

---

## :dart: 跟其他工具差在哪

**標準配備** — 記憶工具該有的，我都有：

- Smart Context：根據工作目錄自動載入對應專案的記憶
- Auto Learn：對話中自動偵測踩坑，存成可重用的技能
- Session 摘要：記錄做了什麼、改了哪些檔案、關鍵決策

**追加安裝** — 標配之外，我還多做了這些：

| 功能 | 說明 |
| :--- | :--- |
| 記憶整理 | 中心 + 分支：MEMORY.md 索引（200 行上限）+ 主題檔案，自動瘦身 |
| 健康監控 | 兩階段：`/健檢` 日常掃描 + `/大健檢` 每週稽核，都能指定專案 |
| 跨專案待辦 | `/待辦` 追蹤所有專案的未完成項目 |
| 緊急還原 | `/想起來` 從 GitHub 備份還原遺失的記憶 |
| 對話管理 | `/壓縮建議` 告訴你什麼時候該壓縮、什麼時候不該 |
| 雙語指令 | 每個指令都有英文 + 繁體中文版（28 個檔案），各自原生撰寫 |
| 備份與同步 | `/備份` 和 `/同步` 對接 GitHub，雙向同步 |
| 學生迴圈 | 八步學習循環：記 → 串 → 學 → 整理 → 精煉 → 再學 → 瘦身 → 收尾。像大考複習，每圈更懂你 |

> 不只是一本筆記本，是一套附帶健檢、緊急還原和自我維護的檔案管理系統。

---

## 怎麼解決

Memory Engine 用 **7 個 hooks** 和 **14 個指令**（每個都有英文 + 中文版）搞定這些問題。

### :link: Hooks（自動執行）

你不用做任何事，這些 hooks 會自己在背景跑。

| Hook | 什麼時候跑 | 做什麼 |
| :--- | :--------- | :----- |
| `session-start` | 每次開新對話 | 自動載入上次的工作摘要 + 根據專案目錄載入對應的記憶 |
| `session-end` | 每次對話結束 | 存下這次做了什麼、改了哪些檔案，同時掃描踩坑紀錄 |
| `memory-sync` | 每次你送訊息 | 偵測記憶檔案有沒有被其他 session 更新，有的話通知變了什麼 |
| `write-guard` | 每次寫入檔案前 | 攔截 `.env`、`credentials` 等敏感檔案，提醒你別推上去 |
| `pre-push-check` | 每次 git push 前 | 檢查 staged 裡有沒有敏感檔案，force push 額外警告 |
| `mid-session-checkpoint` | 每 20 則訊息 | 存中繼紀錄，附帶 mini 分析（做了什麼、碰了哪個專案） |

### :speech_balloon: 指令

每個指令都有英文和中文版，用哪個都行。

**日常操作** — 每天都會用到的基本功

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/存記憶` | `/save` | 跨 session 存記憶 — 自動去重複、分類歸檔，不會弄丟上下文 |
| `/讀取` | `/reload` | 把記憶檔案完整載入目前的對話，讓 Claude 能引用細節 |
| `/待辦` | `/todo` | 跨專案待辦追蹤 — 列出未完成項目、建議下一步 |
| `/備份` | `/backup` | 把本地記憶推到 GitHub 備份 |
| `/同步` | `/sync` | 雙向同步 — 推本地變更、拉遠端更新 |

>「這件事下次還要用」→ `/存記憶`。「剛開新對話，幫我想起來上次在幹嘛」→ `/讀取`。「今天要做什麼」→ `/待辦`。做完一個段落，怕電腦壞掉 → `/備份`。

**反思與學習** — 讓 Claude 自己進步

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/回顧` | `/diary` | 從對話產生反思日記 — 做了什麼、學到什麼、發現什麼規律 |
| `/反思` | `/reflect` | 分析最近的日記和踩坑紀錄，找出重複的模式，提出改善建議 |
| `/學習` | `/learn` | 存踩坑經驗 — 走過的錯路、最後找到的解法 |

>今天聊完覺得有收穫 → `/回顧`。一週過去了，想看看有沒有一直重複的問題 → `/反思`。剛踩了一個大坑，花了半小時才解決 → `/學習`（其實 Claude 遇到大坑時會自己存，不用你動手）。

**健檢** — 定期檢查記憶系統有沒有問題

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/健檢` | `/check` | 小健檢 — 記憶容量、斷鏈、孤兒檔案、環境狀態 |
| `/大健檢` | `/full-check` | 完整稽核 — 小健檢全部 + 指令層、交叉引用、Git repo、環境設定 |
| `/記憶健檢` | `/memory-health` | 專看記憶檔案的行數、更新日期、容量警告 |

>覺得 Claude 怪怪的，反應不對 → `/健檢`。每週花一分鐘做個全身檢查 → `/大健檢`。想知道記憶快不快滿了 → `/記憶健檢`。三個都可以加目標，例如 `/健檢 blog` 只看 blog 相關的。

**搜尋與維護** — 找東西 + 緊急狀況

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/搜尋記憶` | `/memory-search` | 用關鍵字搜尋所有記憶檔案 |
| `/想起來` | `/recover` | 記憶不見時從 GitHub 備份還原 |
| `/壓縮建議` | `/compact-guide` | 什麼時候該用 `/compact`、什麼時候不該用的判斷指南 |

>「我之前有記過一個東西，忘記放在哪」→ `/搜尋記憶`。換新電腦或記憶檔案不見了 → `/想起來`（前提是你之前有用 `/備份` 推到 GitHub）。對話越來越長越來越慢 → `/壓縮建議`。

---

## :package: 安裝

**步驟 1** — 建立記憶備份用的 GitHub repo：

> 這一步很重要。沒有備份 repo，`/備份`、`/同步`、`/想起來` 都沒辦法用，記憶只存在本地 — 電腦壞了就全沒了。

```bash
# 建立 private repo（例如 "claude-memory"）
gh repo create claude-memory --private

# Clone 到本地
git clone https://github.com/你的帳號/claude-memory.git ~/.claude/claude-memory
```

**步驟 2** — 把檔案複製到對應位置：

```bash
# hooks 腳本
cp hooks/*.js ~/.claude/scripts/hooks/

# 指令
cp commands/*.md ~/.claude/commands/

# skill 定義（可選，放了之後 Claude 會自動認得這個 Skill）
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**步驟 3** — 建立必要的目錄：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**步驟 4** — 在 `~/.claude/settings.json` 加入 hooks 設定：

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

## :brain: Smart Context：自動載入對應記憶

> 你在哪個資料夾工作，它就自動載入那個專案的記憶。不用設定。

`session-start.js` 會自動掃描 `~/.claude/projects/` 底下所有專案目錄，根據你的工作目錄（CWD）配對，載入對應的記憶檔案。

記憶檔案放在 `~/.claude/projects/{project-id}/memory/` 目錄下。

---

## :detective: Auto Learn：踩坑自動學習

> Claude 踩了坑又解決了，它會自己記下來，下次不再犯同樣的錯。

`session-end.js` 在每次對話結束時，會自動掃描對話紀錄，偵測四種「踩坑」模式：

| 訊號 | 怎麼判斷 | 例子 |
| :--- | :------ | :--- |
| 重試 5+ 次 | 同一個工具對同一個檔案呼叫 5 次以上 | Edit 同個檔案改了 6 次 |
| 錯誤後修正 | 出現 error 之後，同區域成功了 | build 失敗 -> 改 code -> build 成功 |
| 使用者糾正 | 使用者說「不對」「錯了」「改回來」 | 「不是這個檔案」 |
| 來回修改 | 同一個檔案短時間內被反覆修改 | 改了 CSS 又改回來 |

偵測到的踩坑紀錄會自動存到 `~/.claude/skills/learned/auto-pitfall-{date}.md`，下次開新對話時自動提醒。

v1.1 起，踩坑紀錄會同時包含**解法** — 從同一次對話中自動抓出成功的修正，讓你同時看到問題和答案。

> v1.3 排除正常會重複使用的工具（TodoWrite、Agent、Read、Grep、Glob），減少誤判。

---

## :open_file_folder: 檔案結構

```
claude-memory-engine/
  hooks/
    session-start.js          # 開新對話 -> 載入回憶 + smart-context
    session-end.js            # 對話結束 -> 存摘要 + 踩坑偵測
    memory-sync.js            # 每則訊息 -> 跨 session 記憶同步
    write-guard.js            # 寫入檔案前 -> 敏感檔案警告
    pre-push-check.js         # git push 前 -> 安全檢查
    mid-session-checkpoint.js # 每 20 則訊息 -> 中繼紀錄 + mini 分析
  commands/
    # 日常操作
    save.md / 存記憶.md        # 跨 session 存記憶
    reload.md / 讀取.md        # 讀取記憶到目前對話
    todo.md / 待辦.md          # 跨專案待辦
    backup.md / 備份.md        # 推到 GitHub
    sync.md / 同步.md          # 雙向同步
    # 反思與學習
    diary.md / 回顧.md         # 反思日記
    reflect.md / 反思.md       # 規律分析
    learn.md / 學習.md         # 踩坑學習
    # 健檢
    check.md / 健檢.md         # 小健檢
    full-check.md / 大健檢.md   # 大健檢（完整稽核）
    memory-health.md / 記憶健檢.md  # 記憶容量檢查
    # 搜尋與恢復
    memory-search.md / 搜尋記憶.md  # 關鍵字搜尋
    recover.md / 想起來.md      # 緊急還原
    compact-guide.md / 壓縮建議.md  # 壓縮判斷指南
  skill/
    SKILL.md                  # Skill 定義
    references/
      smart-context.md        # CWD 到記憶檔的對應表
      auto-learn.md           # 踩坑偵測規則
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
