# Claude Memory Engine

> [English](README.md) | [繁體中文](README.zh-TW.md) | **日本語**

> 新しい会話を開くたびに、Claude は全部忘れてしまう。
> この Skill があれば、前回の作業も、失敗から学んだことも、ちゃんと覚えていられる。

Claude Code のためのメモリシステム。hooks と markdown だけで動く。データベースも外部 API も不思議なバイナリファイルもない -- 全部読める `.js` と `.md` だけ。

## この Skill でできること

Claude Code を使っていて、こんな経験はないだろうか：

- 前回 30 分かけて解決したバグを、今回もまた同じように踏む
- 「覚えておいて」と言ったのに、次のセッションでは忘れている
- プロジェクト A の話をしていたのに、プロジェクト B に切り替えてもまだ A の話だと思っている
- 長いセッションが圧縮されて、大事な判断が消えてしまう

Memory Engine は 5 つの hooks でこれらを解決する：

| Hook | いつ実行 | 何をする |
| ---- | ------- | ------- |
| session-start | 新しい会話のたび | 前回の作業要約を自動読み込み + 作業ディレクトリに応じたメモリを読み込み |
| session-end | 会話終了時 | 作業内容と変更ファイルを保存、同時に「踏み抜き」パターンを検出 |
| memory-sync | メッセージ送信のたび | 他のセッションでメモリが更新されたか検出し、変更内容を通知 |
| write-guard | ファイル書き込み前 | `.env`、`credentials` など機密ファイルへの書き込みを警告 |
| pre-push-check | git push 前 | ステージングに機密ファイルがないかチェック、force push は追加警告 |

さらに 3 つのコマンド：

| コマンド | 機能 |
| ------- | ---- |
| `/diary` | 今回の会話から振り返り日記を生成 -- 何をしたか、何を学んだか、どんなパターンがあったか |
| `/reflect` | 最近の日記と踏み抜き記録を分析し、繰り返しパターンを発見、改善を提案 |
| `/memory-health` | 全メモリファイルの行数、更新日、健全状態を一覧表示 |

## インストール

1. ファイルを対応する場所にコピー：

```bash
# hooks スクリプト
cp hooks/*.js ~/.claude/scripts/hooks/

# コマンド
cp commands/*.md ~/.claude/commands/

# Skill 定義（任意 -- Claude が自動的にこの Skill を認識する）
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

2. `~/.claude/settings.json` に hooks 設定を追加：

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

3. 必要なディレクトリを作成：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

4. Claude Code を再起動。

## Smart Context：プロジェクトに応じたメモリ自動読み込み

`session-start.js` は作業ディレクトリ（CWD）からプロジェクトを判定し、対応するメモリファイルを読み込む。

カスタマイズは `session-start.js` の `PROJECT_CONTEXT` 配列を編集：

```javascript
const PROJECT_CONTEXT = [
  {
    keywords: ['my-project'],       // CWD にこのキーワードが含まれていたら
    name: 'My Project',             // 表示名
    files: ['project-notes.md'],    // 読み込むメモリファイル
  },
];
```

メモリファイルは `~/.claude/projects/{project-id}/memory/` に配置。

## Auto Learn：踏み抜き自動学習

`session-end.js` は会話終了時に自動的に会話ログをスキャンし、4 種類の「踏み抜き」パターンを検出する：

| シグナル | 判定方法 | 例 |
| ------- | ------- | -- |
| 3 回以上リトライ | 同一ファイルに同一ツールが 3 回以上呼ばれた | 同じファイルを 4 回 Edit |
| エラー後修正 | エラー発生後、同じ箇所が成功した | build 失敗 -> コード修正 -> build 成功 |
| ユーザー訂正 | ユーザーが「違う」「それじゃない」「戻して」と言った | 「そのファイルじゃない」 |
| 行ったり来たり | 同一ファイルが短期間に繰り返し編集された | CSS を変更してまた戻した |

検出された記録は `~/.claude/skills/learned/auto-pitfall-{date}.md` に保存され、次回セッション開始時に自動で振り返る。

## ファイル構成

```
claude-memory-engine/
  hooks/
    session-start.js    # 新セッション -> 記憶読み込み + smart-context
    session-end.js      # セッション終了 -> 要約保存 + 踏み抜き検出
    memory-sync.js      # メッセージごと -> クロスセッション同期
    write-guard.js      # ファイル書き込み前 -> 機密ファイル警告
    pre-push-check.js   # git push 前 -> 安全チェック
  commands/
    diary.md            # /diary 振り返り日記
    reflect.md          # /reflect 振り返り分析
    memory-health.md    # /memory-health メモリ健全性チェック
  skill/
    SKILL.md            # Skill 定義
    references/
      smart-context.md  # CWD とメモリファイルの対応表
      auto-learn.md     # 踏み抜き検出ルール
```

## カスタマイズ

この Skill は自由に改変できるように設計されている。よくある調整：

- **Smart Context の対応表**：`session-start.js` の `PROJECT_CONTEXT` を編集
- **踏み抜き検出キーワード**：`session-end.js` の `correctionKeywords` を編集
- **機密ファイルパターン**：`write-guard.js` の `PROTECTED_PATTERNS` を編集
- **セッション保持数**：`session-end.js` の `MAX_SESSIONS` を編集（デフォルト 30）

## 設計思想

### なぜデータベースを使わないのか？

Markdown ファイルはそのまま読めて、編集できて、git commit できる。
追加パッケージもサーバーもクエリ言語も不要。
Claude Code はもともと `.md` を読める -- わざわざ複雑にする必要はない。

### なぜプラグインにしないのか？

プラグインはブラックボックス -- 何を変えたか、何を保存したか、何を読んだか分からない。
Hooks + Commands は透明 -- すべての `.js` ファイルを開いて確認できる。気に入らなければ変えればいい、不要なら消せばいい。
ツールは自分がコントロールするもので、ツールにコントロールされるものではない。

## インスピレーションと謝辞

この Skill のコンセプトは 3 つのオープンソースプロジェクトからインスピレーションを受けた。ここで明確にしておく：

**すべてのコードはゼロから書かれたものであり、以下のプロジェクトからコードのコピー、fork、改変は一切行っていない。**

3 つのツールがそれぞれ何を得意としているかを研究し、そのコンセプトを融合して新しい実装を作った。3 つのレストランのメニューを見て、自分の食材と自分のレシピで新しい料理を作ったようなもの。

| プロジェクト | インスピレーションを受けたコンセプト | リンク |
| ---------- | ------------------------------ | ----- |
| [contextstream/claude-code](https://github.com/contextstream/claude-code) | Smart Context：hooks で関連メモリを自動注入、失敗からの自動学習 | contextstream |
| [memvid/claude-brain](https://github.com/memvid/claude-brain) | メモリ統計、軽量ポータブルな設計思想 | memvid |
| [rlancemartin/claude-diary](https://github.com/rlancemartin/claude-diary) | /diary 振り返りエントリ、/reflect パターン分析のコンセプト | rlancemartin (MIT License) |

これらの開発者の共有に感謝する。Claude Code コミュニティがより良くなるために。

## 必要条件

- Claude Code（hooks サポートあり）
- Node.js 18+
- 追加依存なし（ゼロ依存）

## ライセンス

MIT License

---

Made by [HelloRuru](https://ohruru.com) -- ツールは透明で、シンプルで、自分で理解できるものであるべきだと信じている人。
