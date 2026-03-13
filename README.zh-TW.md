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
  <img src="https://img.shields.io/badge/version-1.5.1-C4B7D7?style=flat-square" alt="v1.5.1">
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

**context 滿的時候** — 與其等對話結束，`PreCompact` 選擇往前一步：在 context 壓縮之前就觸發。壓縮前先存一份快照（摘要、踩坑偵測、備份），不管對話後來怎麼走、怎麼停，都有存檔點可以接上。

**期末總複習（手動，用 `/反思` 觸發）**

累積幾天的筆記後，跑一次 `/反思`：

4. **回顧整理** — 讀最近 7 天的筆記和踩坑紀錄，標記有效或過時
5. **精煉** — 四問決策：要留嗎？→ 能濃縮？→ 已有規則涵蓋？→ 清除是最後手段
6. **再學一遍** — 用整理過的資料重新分析，找出重複模式
7. **瘦身** — 列出可清除的項目，你確認後才刪
8. **收尾** — 產出報告：學到什麼、改了什麼、下一圈注意什麼

> 不是跑一次就好。每跑一圈，筆記更精煉、規律更清楚、踩坑更少。

### :pencil2: 訂正複習機制

有些錯，error log 抓不到。你改了它寫的東西，它才知道「喔，這裡不對」。這種錯不會自動被記住——除非有人幫它建一本錯題本。

**記錯題**（`/分析`，改完後手動打）

- 你改完它的稿，打 `/分析`
- 逐句比對兩版差異，對照既有規則
- 已有的原則沒做到 → 記錯題，標次數
- 規則裡沒有的 → 歸納成新原則
- 改完馬上打最好，context 越新鮮越準

**複習**（自動：每次任務前 / 手動：隨時打 `/訂正`）

- 動手之前自動掃一遍錯題本
- 不是重新學，就是提醒：「這個上次錯過，別再犯」
- 想自己翻？打 `/訂正` 就好，不用等任務、不用等迴圈

**整理**（`/反思` 步驟 6，手動觸發）

- 定期掃整本錯題本
- 同一個錯 3 次以上 → 升級成硬規則
- 已經學會的 → 標記清除，不佔位置

但你清楚，從今往後你的 AI 又成長了一些。

<details>
<summary><strong>常見問題</strong></summary>

**我可以直接打 `/訂正` 嗎？**
可以。`/訂正` 隨時都能用，不用等任務、不用等迴圈。它就是打開錯題本，讓你看目前有哪些還沒改掉的。

**`/反思` 大概多久要用一次？**
沒有固定頻率。建議一週一次，或是覺得錯題本太雜的時候跑一次。`/反思` 的步驟 6 負責整理——重複犯 3 次以上的升級成硬規則，已經學會的標記清除。

**一定要先跑 `/分析` 才能用 `/訂正` 嗎？**
不用。`/分析` 是記新的錯題，`/訂正` 是複習已有的。兩個互相獨立。就算你從來沒跑過 `/分析`，`/訂正` 照樣能顯示錯題本裡已經有的內容。

</details>

### :detective: 智慧載入（Smart Context）+ 自動學習（Auto Learn）

**智慧載入**（自動，不用設定）

- 你在哪個資料夾工作，它就載入那個專案的記憶
- 切換專案自動切換，不用手動指定

**自動學習**（自動，session 結束時）

- 踩了坑又解決了 → 自動記下問題和解法
- 下次開新對話時提醒自己
- 同一種錯跨天出現 3 次以上 → 建議寫進長期規則

### :link: 日常工具

| 能力 | 說明 |
| :--- | :--- |
| 健檢 | `/健檢` 日常掃描 + `/大健檢` 每週稽核，確保記憶系統健康 |
| 待辦 | `/待辦` 追蹤所有專案的未完成項目 |
| 備份 | `/備份` `/同步` 對接 GitHub，雙向同步，電腦壞了也不怕 |
| 跨裝置 | 設定 GitHub 記憶 repo，記憶就能跨裝置共用。換電腦？跑 `/想起來` 就拉回來 |
| 還原 | `/想起來` 從 GitHub 備份還原遺失的記憶 |
| 搜尋 | `/搜尋記憶` 用關鍵字搜尋所有記憶檔案 |
| 雙語 | 每個指令都有英文 + 繁體中文版（36 個檔案） |

<details>
<summary><strong>完整指令列表</strong></summary>

> **不知道有哪些指令？** 打 `/全覽`（`/overview`）就能看到全部。

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
| `/分析` | `/analyze` | 記錄訂正到錯題本 |
| `/訂正` | `/correct` | 隨時翻錯題本 |

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
| `/全覽` | `/overview` | 列出所有可用指令 |

**協作**

你同時開了三個 Claude Code 視窗，一個在修 bug、一個在寫文件、一個在整理程式碼。你切過去，那邊完全不知道你剛才在幹嘛。

`/存記憶` 存的是長期記得的事。`/備份` 是把東西推到 GitHub。`/交接` 不一樣 — 它記的是「你現在做到哪」：哪些做完了、哪些還沒、做了什麼決定。

| 中文 | EN | 功能 |
| :--- | :- | :--- |
| `/交接` | `/handoff` | 產生交接檔案，讓另一個 session 接手 |

**怎麼運作：**在 A 視窗打 `/交接`，它會存一份交接檔，記下進度、決策、待做的事。B 視窗不用打任何指令 — 它自動收到。如果 B 已經在對話中，它會即時偵測到新的交接。如果 B 開新對話，它會在啟動時載入。不管哪種，看一次就好，不會重複顯示。

</details>

<details>
<summary><strong>8 個 Hooks（全部自動執行）</strong></summary>

| Hook | 觸發時機 | 做什麼 |
| :--- | :------- | :----- |
| `session-start` | 開新對話 | 載入上次摘要 + 專案記憶 + 待接收交接 |
| `session-end` | 對話結束 | 存摘要 + 踩坑偵測 |
| `pre-compact` | context 壓縮時（自動或手動） | 壓縮前快照 + 踩坑偵測 + 備份 — 真正的安全網 |
| `memory-sync` | 每次送訊息 | 偵測跨 session 記憶變更 + 新交接 |
| `write-guard` | 寫入檔案前 | 敏感檔案攔截 |
| `pre-push-check` | git push 前 | 安全檢查 |
| `mid-session-checkpoint` | 每 20 則訊息 | 存中繼紀錄 + mini 分析 |

</details>

---

## :arrows_counterclockwise: 跨裝置同步

Memory Engine 透過 GitHub repo 實現跨裝置同步。設定一次，所有電腦都能用。

**怎麼運作：**

1. `/備份` 把本地記憶推到你的私人 GitHub repo
2. `/同步` 雙向同步 — 推本地、拉遠端
3. `/想起來` 在新裝置上把所有記憶拉回來 — 記憶、踩坑紀錄、專案歷史全部回來

**換電腦、重灌系統、多台裝置之間切換** — 跑一次 `/想起來`，Claude 就能接上之前所有的脈絡。不用重新教偏好，不用重來。

> GitHub repo 預設是 private。你的記憶不會碰到你自己 GitHub 帳號以外的任何外部服務。

---

## :package: 安裝

**步驟 1** — 建立記憶備份用的 GitHub repo：

> 沒有備份 repo，`/備份`、`/同步`、`/想起來` 都沒辦法用。記憶只存在本地，電腦壞了就全沒了。有了 repo，記憶就能跨裝置使用。

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
    "PreCompact": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/hooks/pre-compact.js"
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

## :rocket: 快速上手

裝完了？接下來這樣用。

1. **直接開始工作** — 打開 Claude Code 就好。`session-start` 會自動載入上次的脈絡
2. **做完直接關** — `session-end` 自動存摘要、偵測踩坑
3. **想記住什麼？** — `/存記憶` 存到長期記憶
4. **要切視窗？** — `/交接` 把進度傳給下一個視窗
5. **累積幾天後** — `/反思` 整理筆記、找規律、清理過期的

就這樣。其他的都在背景自動跑。

---

## :zap: Token 消耗

Memory Engine 幾乎不會增加日常的 token 用量。

| Hook | 什麼時候跑 | Token 消耗 |
| :--- | :---------- | :--------- |
| `session-start` | 每次開新對話 | 約 200–500 tokens（載入上次摘要 + 專案記憶） |
| `memory-sync` | 每則訊息 | **0**，除非其他 session 改了記憶檔 |
| `mid-session-checkpoint` | 每則訊息 | **0**，除非剛好第 20 則 |
| `write-guard` | 寫檔案前 | **0**，除非寫到敏感檔案 |
| `pre-push-check` | git push 前 | **0**，除非正在 push |
| `session-end` / `pre-compact` | 對話結束 / 壓縮時 | 輸出不會注入 context |

**SKILL.md**（136 行）是 learned skill — Claude Code 只在需要時才載入，不是每次對話都吃。

**總結：** 每次開新對話多約 200–500 tokens。其他沒觸發就是零。

---

## :wrench: 客製化

| 想改什麼 | 去哪裡改 |
| :------- | :------ |
| 對應表 | Smart Context 自動解析每個專案的記憶目錄（不用設定），可在 `session-start.js` 調整 |
| 踩坑關鍵字 | `session-end.js` 的 `correctionKeywords` |
| 敏感檔案 | `write-guard.js` 的 `PROTECTED_PATTERNS` |
| 保留數量 | `session-end.js` 的 `MAX_SESSIONS`（預設 30） |

---

## :bulb: 設計理念

**為什麼不用資料庫？**

- Markdown 你打開就能讀、能改、能 git commit
- Claude Code 本身就會讀 `.md`，何必多此一舉

**為什麼不做成 Plugin？**

- Plugin 是黑盒子
- Hooks + Commands 是透明的 — 每個 `.js` 你都能打開看
- 不喜歡就改，覺得多餘就刪
- 工具應該是你掌控它，不是它掌控你

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

**v1.5.1 — 快速參考**
- 指令表和 SKILL.md 加入 `/全覽`（`/overview`）
- 36 個雙語指令檔案（18 對 EN + ZH）

**v1.5 — Session 交接 + 共用核心**
- Session 交接（Handoff）— 切換 Claude Code 視窗時不遺失脈絡。`/交接` 產生交接檔案，下個 session 自動接收
- 訂正複習機制 — `/分析` 比對你的修改和規則，記錯題、建錯題本，任務前自動複習
- `shared-utils.js` — 抽出 `session-end.js` 和 `pre-compact.js` 的共用函式，消除約 80% 重複程式碼
- Smart Context 自動解析每個專案對應的記憶目錄，不寫死路徑
- 備份範圍擴大：`/備份` 和 `/同步` 現在涵蓋 hooks、記憶引擎、所有專案的記憶
- 36 個雙語指令檔案（EN + ZH），從 28 個增加

**v1.4 — 真正的安全網**
- PreCompact hook — context 壓縮前自動存快照（自動或手動都抓得到）
- 跨裝置同步 — GitHub 記憶 repo 跨裝置共用，新裝置跑 `/想起來` 全部拉回來
- 比結束再往前一步觸發 — 不管對話怎麼停，都有存檔點可以接上

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
    session-start.js          # 開新對話 -> 載入回憶 + smart-context + 交接
    session-end.js            # 對話結束 -> 存摘要 + 踩坑偵測
    pre-compact.js            # context 壓縮前 -> 快照 + 踩坑偵測 + 備份
    shared-utils.js           # 共用函式（transcript、踩坑、備份）
    memory-sync.js            # 每則訊息 -> 跨 session 記憶同步 + 交接
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
    handoff.md / 交接.md        # Session 交接
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
