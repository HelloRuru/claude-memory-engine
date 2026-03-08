<h1 align="center">Claude Memory Engine</h1>

<p align="center">
  <strong>Claude Code のためのメモリシステム。hooks と markdown だけで動く。</strong><br>
  データベースも外部 API も不思議なバイナリファイルもない。<br>
  コードとドキュメントだけ。何も隠さない。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-D4A5A5?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/node-18%2B-B8A9C9?style=flat-square" alt="Node 18+">
  <img src="https://img.shields.io/badge/dependencies-zero-A8B5A0?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/claude_code-hooks-E8B4B8?style=flat-square" alt="Claude Code Hooks">
  <img src="https://img.shields.io/badge/version-1.1-C4B7D7?style=flat-square" alt="v1.1">
</p>

<p align="center">
  <a href="README.md">English</a> &nbsp;|&nbsp; <a href="README.zh-TW.md">繁體中文</a> &nbsp;|&nbsp; <b>日本語</b>
</p>

---

## 課題

新しい会話を開くたびに、Claude は全部忘れてしまう。

- 前回 30 分かけて解決したバグを — 今回もまた同じように踏む
- 「覚えておいて」と言ったのに — 次のセッションでは忘れている
- プロジェクト A の話をしていたのに、B に切り替えても — まだ A の話だと思っている
- 長いセッションが圧縮されて — 大事な判断が消えてしまう

---

## :sparkles: v1.1 の新機能

| 機能 | 説明 |
| :--- | :--- |
| Smart Context 自動検出 | `PROJECT_CONTEXT` の手動設定が不要に。全プロジェクトのメモリディレクトリを自動スキャンし、CWD で照合 |
| 中国語の訂正検出 | 踏み抜き検出が 13 の中国語フレーズ（「不對」「錯了」「改回來」など）に対応 |
| `/memory-search` コマンド | キーワードで全メモリファイルを横断検索 |
| 踏み抜きに解決策を記録 | エラーだけでなく、同じ会話から成功した修正も自動抽出して記録 |
| セッション要約の改善 | 「何をしたか」のトピック抽出を含む要約形式に改善（生メッセージリストではなく） |
| 週次ダイジェスト | 7 日以上前のセッションを自動的に週次レポートに統合、`sessions/digest/` に保存 |

---

## 解決策

Memory Engine は **5 つの hooks** と **4 つのコマンド** でこれらを解決する。

### :link: Hooks

| Hook | いつ実行 | 何をする |
| :--- | :------ | :------ |
| `session-start` | 新しい会話のたび | 前回の作業要約を自動読み込み + 作業ディレクトリに応じたメモリを読み込み |
| `session-end` | 会話終了時 | 作業内容と変更ファイルを保存、同時に「踏み抜き」パターンを検出 |
| `memory-sync` | メッセージ送信のたび | 他のセッションでメモリが更新されたか検出し、変更内容を通知 |
| `write-guard` | ファイル書き込み前 | `.env`、`credentials` など機密ファイルへの書き込みを警告 |
| `pre-push-check` | git push 前 | ステージングに機密ファイルがないかチェック、force push は追加警告 |

### :speech_balloon: コマンド

| コマンド | 機能 |
| :------ | :--- |
| `/diary` | 今回の会話から振り返り日記を生成 — 何をしたか、何を学んだか |
| `/reflect` | 最近の日記と踏み抜き記録を分析し、繰り返しパターンを発見 |
| `/memory-health` | 全メモリファイルの行数、更新日、健全状態を一覧表示 |
| `/memory-search` | キーワードで全メモリファイルを横断検索 |

---

## :package: インストール

**ステップ 1** — ファイルを対応する場所にコピー：

```bash
# hooks スクリプト
cp hooks/*.js ~/.claude/scripts/hooks/

# コマンド
cp commands/*.md ~/.claude/commands/

# Skill 定義（任意 -- Claude が自動的にこの Skill を認識する）
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**ステップ 2** — 必要なディレクトリを作成：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**ステップ 3** — `~/.claude/settings.json` に hooks 設定を追加：

<details>
<summary><strong>クリックして hooks 設定を展開</strong></summary>

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

**ステップ 4** — Claude Code を再起動。完了！

---

## :brain: Smart Context：プロジェクトに応じたメモリ自動読み込み

`session-start.js` は `~/.claude/projects/` 配下の全プロジェクトディレクトリを自動スキャンし、作業ディレクトリ（CWD）と照合して対応するメモリファイルを読み込む。

手動設定は不要 -- どのプロジェクトで作業しているかを自動検出する。

メモリファイルは `~/.claude/projects/{project-id}/memory/` に配置。

---

## :detective: Auto Learn：踏み抜き自動学習

`session-end.js` は会話終了時に自動的に会話ログをスキャンし、4 種類の「踏み抜き」パターンを検出する：

| シグナル | 判定方法 | 例 |
| :------ | :------ | :- |
| 3 回以上リトライ | 同一ファイルに同一ツールが 3 回以上呼ばれた | 同じファイルを 4 回 Edit |
| エラー後修正 | エラー発生後、同じ箇所が成功した | build 失敗 -> コード修正 -> build 成功 |
| ユーザー訂正 | ユーザーが「違う」「それじゃない」「戻して」と言った | 「そのファイルじゃない」 |
| 行ったり来たり | 同一ファイルが短期間に繰り返し編集された | CSS を変更してまた戻した |

検出された記録は `~/.claude/skills/learned/auto-pitfall-{date}.md` に保存され、次回セッション開始時に自動で振り返る。

v1.1 では、踏み抜き記録に**解決策**も含まれるようになった -- 同じ会話から成功した修正を自動抽出し、問題と解決策の両方を記録する。

---

## :open_file_folder: ファイル構成

```
claude-memory-engine/
  hooks/
    session-start.js      # 新セッション -> 記憶読み込み + smart-context
    session-end.js        # セッション終了 -> 要約保存 + 踏み抜き検出
    memory-sync.js        # メッセージごと -> クロスセッション同期
    write-guard.js        # ファイル書き込み前 -> 機密ファイル警告
    pre-push-check.js     # git push 前 -> 安全チェック
  commands/
    diary.md              # /diary 振り返り日記
    reflect.md            # /reflect 振り返り分析
    memory-health.md      # /memory-health メモリ健全性チェック
    memory-search.md      # /memory-search キーワード検索
  skill/
    SKILL.md              # Skill 定義
    references/
      smart-context.md    # CWD とメモリファイルの対応表
      auto-learn.md       # 踏み抜き検出ルール
```

---

## :wrench: カスタマイズ

この Skill は自由に改変できるように設計されている。よくある調整：

| 何を変えたいか | どこを変えるか |
| :------------ | :----------- |
| Smart Context の対応表 | v1.1 で自動検出（設定不要）。`session-start.js` の `autoDetectProjectContext()` で調整可能 |
| 踏み抜き検出キーワード | `session-end.js` の `correctionKeywords` |
| 機密ファイルパターン | `write-guard.js` の `PROTECTED_PATTERNS` |
| セッション保持数 | `session-end.js` の `MAX_SESSIONS`（デフォルト 30） |

---

## :bulb: 設計思想

**なぜデータベースを使わないのか？**
Markdown ファイルはそのまま読めて、編集できて、git commit できる。追加パッケージもサーバーもクエリ言語も不要。Claude Code はもともと `.md` を読める -- わざわざ複雑にする必要はない。

**なぜプラグインにしないのか？**
プラグインはブラックボックス -- 何を変えたか、何を保存したか、何を読んだか分からない。Hooks + Commands は透明 -- すべての `.js` ファイルを開いて確認できる。気に入らなければ変えればいい、不要なら消せばいい。ツールは自分がコントロールするもので、ツールにコントロールされるものではない。

---

## :pray: インスピレーションと謝辞

この Skill のコンセプトは 3 つのオープンソースプロジェクトからインスピレーションを受けた。ここで明確にしておく：

> **すべてのコードはゼロから書かれたものであり、以下のプロジェクトからコードのコピー、fork、改変は一切行っていない。**
>
> 3 つのツールがそれぞれ何を得意としているかを研究し、そのコンセプトを融合して新しい実装を作った。3 つのレストランのメニューを見て、自分の食材と自分のレシピで新しい料理を作ったようなもの。

| プロジェクト | インスピレーションを受けたコンセプト | リンク |
| :---------- | :------------------------------ | :---- |
| contextstream/claude-code | Smart Context：hooks で関連メモリを自動注入、失敗からの自動学習 | [GitHub](https://github.com/contextstream/claude-code) |
| memvid/claude-brain | メモリ統計、軽量ポータブルな設計思想 | [GitHub](https://github.com/memvid/claude-brain) |
| rlancemartin/claude-diary | /diary 振り返りエントリ、/reflect パターン分析のコンセプト | [GitHub](https://github.com/rlancemartin/claude-diary) |

これらの開発者の共有に感謝する。Claude Code コミュニティがより良くなるために。

---

## 必要条件

- Claude Code（hooks サポートあり）
- Node.js 18+
- 追加依存なし（ゼロ依存）

## ライセンス

MIT -- 詳細は [LICENSE](LICENSE) を参照。

---

<p align="center">
  Made by <a href="https://ohruru.com">HelloRuru</a> -- ツールは透明で、シンプルで、自分で理解できるものであるべきだと信じている人。
</p>
