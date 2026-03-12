<h1 align="center">Claude Memory Engine</h1>

<p align="center">
  <strong>ただの記憶じゃない — 学ぶ力がある。</strong><br>
  同じ間違いを繰り返さない。成長し続ける。<br>
  AI も学生のように、サイクルを重ねて成長できる。
</p>

<p align="center">
  hooks と markdown だけで動く。データベースも外部 API もない。<br>
  コードとドキュメントだけ。何も隠さない。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-D4A5A5?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/node-18%2B-B8A9C9?style=flat-square" alt="Node 18+">
  <img src="https://img.shields.io/badge/dependencies-zero-A8B5A0?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/claude_code-hooks-E8B4B8?style=flat-square" alt="Claude Code Hooks">
  <img src="https://img.shields.io/badge/version-1.4-C4B7D7?style=flat-square" alt="v1.4">
</p>

<p align="center">
  <a href="README.md">English</a> &nbsp;|&nbsp; <a href="README.zh-TW.md">繁體中文</a> &nbsp;|&nbsp; <b>日本語</b>
</p>

---

## WHAT — 新しい会話のたびに、Claude はゼロからやり直す

- 前回 30 分かけて踏んだ落とし穴 — 今回もまた同じところを踏む
- 教えた好みやプロジェクトルール — 次のセッションで全部リセット
- プロジェクト A から B に切り替えたら — どっちがどっちか分からない
- 長い会話はぼやけていく — 圧縮後に重要な判断が消える
- メモリファイルが増え続ける — 誰も整理しない、溜まる一方
- PC が壊れたら — ローカルの記憶は全部消える、バックアップもない

記憶ツールで「覚える」ことはできる。でも、覚えることと学ぶことは違う。

---

## WHY — 学ぶ力があるから

Memory Engine は Claude に記憶させるだけじゃない。学生のように学ばせる：

- 同じミスを繰り返さない — 問題と解決策を自分で記録する
- プロジェクトを切り替えてもやり直し不要 — 今何をしているか分かっている
- 使うほど賢くなる — サイクルを重ねるたびに理解が深まる
- 学び方が見える — 全部 markdown と JS、ブラックボックスなし

---

## HOW — 学習ループで

- **学習ループ** — 8 ステップの学習サイクル、期末試験の準備のように繰り返し成長
- **Smart Context** — 作業ディレクトリに応じて、対応プロジェクトの記憶を自動読み込み
- **Auto Learn** — 落とし穴を踏んだら問題と解決策を自動記録、同じミスを繰り返さない

### :brain: 学習ループ

> 期末試験の準備みたいなもの。Claude Code を試験勉強中の学生のように動かす — 授業が終わるたびにノートを取り、分類して整理し、パターンを見つけ、間違いノートを作り、期末に総復習する。一周するたびに、少しずつ賢くなる。

### 授業（自動 — 毎回の会話で実行）

会話が終わるたびに、Claude が自動で 3 つのことをする：

1. **ノートを取る** — 何をしたか、どのファイルを変えたか、重要な判断を記録
2. **つなげる** — どのプロジェクトに属するかを紐づけ、過去のノートとリンク
3. **パターンを見つける** — 会話をスキャンし、落とし穴パターンを検出（同じミスを 5 回リトライ、エラー後の修正、ユーザーによる訂正、行ったり来たりの編集）

20 メッセージごとに中間チェックポイントも自動保存。長い会話が圧縮されても、大事な内容を失わない。

**context が満杯になった時** — 会話の終了を待つのではなく、`PreCompact` は一歩手前で発火する：context 圧縮の直前。このタイミングでスナップショットを保存（要約、落とし穴検出、バックアップ）するので、会話がどう続いても、どう終わっても、必ずセーブポイントが残る。

### 期末総復習（手動 — `/reflect` で実行）

数日分のノートが溜まったら、`/reflect` を一回実行。Claude が以下を行う：

4. **振り返り** — 直近 7 日のノートと落とし穴記録を読み、有効なものと古くなったものを仕分け
5. **精錬する** — 四問判断で決定：残すべき？ → 凝縮できる？ → 既存ルールでカバー済み？ → 削除は最後の手段
6. **もう一度学ぶ** — 整理されたクリーンなデータで再分析し、繰り返しパターンを発見
7. **スリム化** — 削除候補をリストアップ、確認後に実行
8. **まとめ** — レポート出力：何を学んだか、何を変えたか、次のサイクルで注意すべきこと

> 一回で終わりじゃない。サイクルを回すたびに、ノートはより洗練され、パターンはより明確になり、落とし穴は減っていく。これが継続的に成長するループ。

### :detective: Smart Context + Auto Learn

**Smart Context** — 作業ディレクトリに応じて、そのプロジェクトのメモリを自動読み込み。設定不要、手動切り替え不要。

**Auto Learn** — 会話中に落とし穴を踏んで解決したら、問題と解決策を自動記録。次の会話でリマインドする。同じ種類のミスが 3 日以上にわたって出現したら、長期ルールへの書き込みを提案。

### :link: 日常ツール

| 機能 | 説明 |
| :--- | :--- |
| 健康診断 | `/check` デイリースキャン + `/full-check` 週次監査で、メモリシステムの健全性を確認 |
| タスク | `/todo` で全プロジェクトの未完了タスクを追跡 |
| バックアップ | `/backup` `/sync` で GitHub と双方向同期。PCが壊れても安心 |
| クロスデバイス | GitHub メモリリポジトリを設定すれば、デバイス間でメモリを共有。新しいマシンで `/recover` を実行するだけ |
| 復旧 | `/recover` で GitHub バックアップからメモリを復元 |
| 検索 | `/memory-search` でキーワード横断検索 |
| 二言語 | 全コマンドに英語 + 中国語版（28 ファイル） |

<details>
<summary><strong>全コマンド一覧</strong></summary>

**日常操作**

| コマンド | 機能 |
| :------- | :--- |
| `/save` | セッション間のメモリ保存 — 重複排除、分類、自動振り分け |
| `/reload` | メモリを現在の会話に読み込み |
| `/todo` | クロスプロジェクトタスク追跡 |
| `/backup` | ローカルメモリを GitHub にプッシュ |
| `/sync` | 双方向同期 — プッシュ + プル |

**振り返りと学習**

| コマンド | 機能 |
| :------- | :--- |
| `/diary` | 振り返り日記を生成 |
| `/reflect` | 落とし穴記録を分析し、繰り返しパターンを発見 |
| `/learn` | 落とし穴の経験を手動保存 |

**健康診断**

| コマンド | 機能 |
| :------- | :--- |
| `/check` | クイックチェック — 容量、リンク切れ、孤立ファイル |
| `/full-check` | 包括的監査 — コマンド層、Git リポジトリ、環境設定 |
| `/memory-health` | メモリファイルの行数、更新日、容量警告 |

**検索とメンテナンス**

| コマンド | 機能 |
| :------- | :--- |
| `/memory-search` | キーワードで全メモリファイルを横断検索 |
| `/recover` | GitHub バックアップから復元 |
| `/compact-guide` | いつ圧縮すべきかの判断ガイド |

</details>

<details>
<summary><strong>8 つの Hooks（すべて自動実行）</strong></summary>

| Hook | 実行タイミング | 動作 |
| :--- | :----------- | :--- |
| `session-start` | 新しい会話 | 前回の要約 + プロジェクトメモリを読み込み |
| `session-end` | 会話終了 | 要約を保存 + 落とし穴パターンを検出 |
| `pre-compact` | context 圧縮時（自動またはマニュアル） | 圧縮前スナップショット + 落とし穴検出 + バックアップ — 本当のセーフティネット |
| `memory-sync` | メッセージ送信時 | クロスセッションのメモリ変更を検出 |
| `write-guard` | ファイル書き込み前 | 機密ファイルへの書き込みを警告 |
| `pre-push-check` | git push 前 | セキュリティチェック |
| `mid-session-checkpoint` | 20 メッセージごと | 中間チェックポイント + ミニ分析 |

</details>

---

## :arrows_counterclockwise: クロスデバイス同期

Memory Engine は GitHub リポジトリを通じたクロスデバイス同期をサポート。一度設定すれば、すべてのマシンでメモリが使える。

**仕組み：**

1. `/backup` でローカルメモリをプライベート GitHub リポジトリにプッシュ
2. `/sync` で双方向同期 — ローカルの変更をプッシュ、リモートの更新をプル
3. `/recover` で新しいデバイスにすべてのメモリを復元 — メモリ、落とし穴記録、プロジェクト履歴のすべてが戻る

**ノート PC を乗り換えても、OS を再インストールしても、新しいワークステーションをセットアップしても** — `/recover` を一回実行するだけで、Claude は以前のすべてのコンテキストを引き継ぐ。好みを教え直す必要も、コンテキストを失う心配もない。

> GitHub リポジトリはデフォルトで private。メモリがあなた自身の GitHub アカウント以外の外部サービスに触れることはない。

---

## :package: インストール

**ステップ 1** — メモリバックアップ用の GitHub リポジトリを作成：

> バックアップリポジトリがないと `/backup`、`/sync`、`/recover` は使えない。メモリはローカルにしか存在せず、マシンが壊れたら全て失われる。リポジトリがあれば、メモリはデバイスを越えて使える。

```bash
gh repo create claude-memory --private
git clone https://github.com/YOUR_USERNAME/claude-memory.git ~/.claude/claude-memory
```

**ステップ 2** — ファイルをコピー：

```bash
cp hooks/*.js ~/.claude/scripts/hooks/
cp commands/*.md ~/.claude/commands/
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**ステップ 3** — ディレクトリを作成：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**ステップ 4** — `~/.claude/settings.json` に hooks 設定を追加：

<details>
<summary><strong>クリックして設定を展開</strong></summary>

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

**ステップ 5** — Claude Code を再起動。完了！

---

## :wrench: カスタマイズ

| 項目 | 場所 |
| :--- | :--- |
| 対応表 | Smart Context v1.1 で自動検出（通常不要）、`session-start.js` で調整 |
| キーワード | `session-end.js` の `correctionKeywords` |
| 機密ファイル | `write-guard.js` の `PROTECTED_PATTERNS` |
| 保持数 | `session-end.js` の `MAX_SESSIONS`（デフォルト 30） |

---

## :bulb: 設計思想

**なぜデータベースを使わないのか？**
Markdown はそのまま読めて、編集できて、git commit できる。Claude Code はもともと `.md` を読める。わざわざ複雑にする必要はない。

**なぜプラグインにしないのか？**
プラグインはブラックボックス。Hooks + Commands は透明 — すべての `.js` を開いて確認できる。気に入らなければ変える、不要なら消す。ツールは自分がコントロールするもの。ツールにコントロールされるものじゃない。

---

## :pray: インスピレーション

> **すべてのコードはゼロから書いた。以下のプロジェクトからのコピー、fork、改変は一切ない。**

| プロジェクト | 何にインスピレーションを受けたか |
| :---------- | :--------------------------- |
| [contextstream/claude-code](https://github.com/contextstream/claude-code) | Smart Context、落とし穴の自動学習 |
| [memvid/claude-brain](https://github.com/memvid/claude-brain) | メモリ統計、軽量設計 |
| [rlancemartin/claude-diary](https://github.com/rlancemartin/claude-diary) | 振り返り日記、パターン分析 |

---

<details>
<summary><strong>バージョン履歴</strong></summary>

**v1.4 — 本当のセーフティネット**
- PreCompact hook — context 圧縮前にスナップショットを自動保存（自動・マニュアル両対応）
- クロスデバイス同期 — GitHub メモリリポジトリでデバイス間共有、新デバイスで `/recover` を実行すれば全て復元
- 終了の一歩手前で発火 — 会話がどう終わっても、セーブポイントが残る

**v1.3 — 学習ループ**
- 8 ステップの学習サイクル（前半 3 ステップ自動、後半 5 ステップ `/reflect` で実行）
- 中間チェックポイント（20 メッセージごと）
- `/reflect` 四問判断ツリー
- SessionEnd 修正（transcript パーサー、IDE ノイズ除去、閾値を 5 に引き上げ）

**v1.2 — 完全コマンドセット**
- 14 の二言語コマンド（日常操作 / 振り返り / 健康診断 / 検索・復旧）
- 二段階チェック（`/check` + `/full-check`）
- クロスプロジェクトタスク、バックアップ同期、緊急復旧、圧縮ガイド

**v1.1 — Smart Context 自動検出**
- 手動設定不要、プロジェクトメモリディレクトリを自動スキャン
- 中国語の訂正検出（13 フレーズ対応）
- 落とし穴記録に解決策を含む、セッション要約の改善、週次ダイジェスト自動生成

</details>

<details>
<summary><strong>ファイル構成</strong></summary>

```
claude-memory-engine/
  hooks/
    session-start.js          # 新セッション -> 記憶読み込み + smart-context
    session-end.js            # セッション終了 -> 要約保存 + 落とし穴検出
    pre-compact.js            # context 圧縮前 -> スナップショット + 落とし穴検出 + バックアップ
    memory-sync.js            # メッセージごと -> クロスセッション同期
    write-guard.js            # ファイル書き込み前 -> 機密ファイル警告
    pre-push-check.js         # git push 前 -> セキュリティチェック
    mid-session-checkpoint.js # 20 メッセージごと -> 中間チェックポイント
  commands/
    save.md / 存記憶.md        # セッション間のメモリ保存
    reload.md / 讀取.md        # メモリ読み込み
    todo.md / 待辦.md          # クロスプロジェクトタスク
    backup.md / 備份.md        # GitHub にプッシュ
    sync.md / 同步.md          # 双方向同期
    diary.md / 回顧.md         # 振り返り日記
    reflect.md / 反思.md       # パターン分析
    learn.md / 學習.md         # 落とし穴学習
    check.md / 健檢.md         # クイックチェック
    full-check.md / 大健檢.md   # 包括的監査
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

## 必要条件

- Claude Code（hooks サポートあり）
- Node.js 18+
- 依存パッケージなし

## ライセンス

MIT -- 詳細は [LICENSE](LICENSE) を参照。

---

<p align="center">
  Made by <a href="https://ohruru.com">HelloRuru</a> — ツールは透明で、シンプルで、自分で理解できるものであるべきだと信じている人。
</p>
