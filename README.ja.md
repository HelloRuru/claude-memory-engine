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
  <img src="https://img.shields.io/badge/version-1.3-C4B7D7?style=flat-square" alt="v1.3">
</p>

<p align="center">
  <a href="README.md">English</a> &nbsp;|&nbsp; <a href="README.zh-TW.md">繁體中文</a> &nbsp;|&nbsp; <b>日本語</b>
</p>

---

## 課題

新しい会話を開くたびに、Claude は全部忘れてしまう。

- 前回 30 分かけて解決したバグを -- 今回もまた同じように踏む
- 「覚えておいて」と言ったのに -- 次のセッションでは忘れている
- プロジェクト A の話をしていたのに、B に切り替えても -- まだ A の話だと思っている
- 長いセッションが圧縮されて -- 大事な判断が消えてしまう

---

## :sparkles: v1.3 の新機能：学生ループ

> 期末試験の準備のようなもの。Claude Code を試験勉強中の学生のように動かす -- 毎回の授業後にノートを取り、整理し、パターンを見つけ、間違いノートを作り、期末に総復習する。一周するたびに、少しずつ賢くなる。

| 機能 | 説明 |
| :--- | :--- |
| 学習ループ（8 ステップ） | 自動ノート（SessionEnd）-> プロジェクト別に連結 -> パターン発見 -> 見直し+整理 -> 精錬 -> 精錬版で再分析 -> スリム化 -> まとめ。前 3 ステップは自動、後 5 ステップは `/reflect` でトリガー |
| 中間チェックポイント | 20 メッセージごとに自動保存、ミニ分析付き（何をしていたか、どのプロジェクトか） |
| `/reflect` 自動リマインド | 新しい会話開始時、前回 `/reflect` からの経過日数をチェック。7 日以上なら通知 |
| 繰り返し踏み抜きアラート | 同じ種類のミスが 3 日以上にわたって出現した場合、永久ルールに書き込むことを提案 |
| ツリー型データ判断 | `/reflect` ステップ 5 で 4 つの質問を使用：成長すべきか? -> 凝縮できるか? -> 既存ルールでカバー済み? -> 削除は最後の手段 |
| SessionEnd バグ修正 | transcript パーサー修正（v1.0 から壊れていた）、IDE ノイズフィルタリング、5 層プロジェクトタグ検出、踏み抜き閾値を 5 に引き上げ |

<details>
<summary>v1.2 の変更点</summary>

| 機能 | 説明 |
| :--- | :--- |
| 14 コマンド（4 から増加） | フルコマンドスイート：日常操作、ヘルスチェック、バックアップ、学習、タスク追跡 |
| バイリンガルコマンド | 全コマンドに英語 + 中国語版（28 ファイル） |
| `/check` + `/full-check` | 二段階ヘルスチェック -- 毎日のクイックスキャンと週次の包括的監査 |
| `/save` `/reload` `/sync` | メモリ操作のナチュラルショートカット |
| `/learn` | 踏み抜き自動学習の明示的コマンド |
| `/todo` | クロスプロジェクトタスク追跡 |
| `/recover` | ローカルメモリ消失時の災害復旧 |
| `/compact-guide` | コンテキスト圧縮のスマートガイド |

</details>

<details>
<summary>v1.1 の変更点</summary>

| 機能 | 説明 |
| :--- | :--- |
| Smart Context 自動検出 | `PROJECT_CONTEXT` の手動設定が不要に。全プロジェクトのメモリディレクトリを自動スキャンし、CWD で照合 |
| 中国語の訂正検出 | 踏み抜き検出が 13 の中国語フレーズ（「不對」「錯了」「改回來」など）に対応 |
| `/memory-search` コマンド | キーワードで全メモリファイルを横断検索 |
| 踏み抜きに解決策を記録 | エラーだけでなく、同じ会話から成功した修正も自動抽出して記録 |
| セッション要約の改善 | 「何をしたか」のトピック抽出を含む要約形式に改善 |
| 週次ダイジェスト | 7 日以上前のセッションを自動的に週次レポートに統合 |

</details>

---

## :dart: 他のツールとの違い

**標準機能** -- メモリツールに期待される基本機能：

- Smart Context：作業ディレクトリに応じてプロジェクト別のメモリを自動読み込み
- Auto Learn：セッション中に踏み抜きを検出し、再利用可能なスキルとして保存
- セッション要約：何をしたか、どのファイルを変更したか、重要な判断を記録

**追加機能** -- Memory Engine ならではの特徴：

| 機能 | 説明 |
| :--- | :--- |
| 学生ループ | 8 ステップの学習サイクル。期末試験の準備のように、毎周期で賢くなる |
| メモリ整理 | ハブ＆スポーク：MEMORY.md インデックス（200 行上限）+ トピックファイル |
| ヘルス監視 | 二段階：`/check` 日次スキャン + `/full-check` 週次監査 |
| クロスプロジェクトタスク | `/todo` で全プロジェクトの未完了タスクを追跡 |
| 災害復旧 | `/recover` で GitHub バックアップからローカルメモリを復元 |
| バイリンガルコマンド | 全コマンドに英語 + 中国語版（28 ファイル） |
| バックアップ＆同期 | `/backup` と `/sync` で GitHub と双方向同期 |

> 単なるメモ帳ではない -- ヘルスチェック、災害復旧、自己メンテナンス機能を備えたファイル管理システム。

---

## 解決策

Memory Engine は **7 つの hooks** と **14 のコマンド**（英語 + 中国語の各版）でこれらを解決する。

### :link: Hooks（自動実行）

何もする必要はない -- これらの hooks はバックグラウンドで自動的に動く。

| Hook | いつ実行 | 何をする |
| :--- | :------ | :------ |
| `session-start` | 新しい会話のたび | 前回の作業要約を自動読み込み + 作業ディレクトリに応じたメモリを読み込み |
| `session-end` | 会話終了時 | 作業内容と変更ファイルを保存、同時に「踏み抜き」パターンを検出 |
| `mid-session-checkpoint` | 20 メッセージごと | 会話中間のチェックポイントを保存、ミニ分析付き |
| `memory-sync` | メッセージ送信のたび | 他のセッションでメモリが更新されたか検出し、変更内容を通知 |
| `write-guard` | ファイル書き込み前 | `.env`、`credentials` など機密ファイルへの書き込みを警告 |
| `pre-push-check` | git push 前 | ステージングに機密ファイルがないかチェック、force push は追加警告 |

### :speech_balloon: コマンド

全コマンドに英語版と中国語版がある。使いやすい方を選べばいい。

**日常操作** -- 毎日使う基本機能

| EN | ZH | 機能 |
| :- | :- | :--- |
| `/save` | `/存記憶` | セッションをまたいでメモリを保存 -- 重複排除、適切なファイルに振り分け、コンテキストを失わない |
| `/reload` | `/讀取` | メモリファイルを現在の会話に読み込み、詳細を参照できるようにする |
| `/todo` | `/待辦` | クロスプロジェクトタスク追跡 -- 未完了タスクを一覧表示、次のステップを提案 |
| `/backup` | `/備份` | ローカルメモリを GitHub バックアップリポジトリにプッシュ |
| `/sync` | `/同步` | 双方向同期 -- ローカルの変更をプッシュ、リモートの更新をプル |

> 「これ次回も使いたい」-> `/save`。「前回何をしていたっけ」-> `/reload`。「やることは何が残ってる」-> `/todo`。作業が一段落したら -> `/backup`。

**反省と学習** -- Claude が自分で成長するための機能

| EN | ZH | 機能 |
| :- | :- | :--- |
| `/diary` | `/回顧` | 振り返り日記を生成 -- 何をしたか、何を学んだか、どんなパターンに気づいたか |
| `/reflect` | `/反思` | 最近の日記と踏み抜き記録を分析し、繰り返しパターンを発見 |
| `/learn` | `/學習` | 踏み抜き経験を保存 -- 試した間違いアプローチ、最終的に見つけた解決策 |

> 良いセッションだった -> `/diary`。週末にまとめて振り返りたい -> `/reflect`。30 分かけてバグを解決した -> `/learn`（実は大きな踏み抜きは Claude が自動で保存してくれる）。

**ヘルスチェック** -- メモリシステムが正常に動いているか確認

| EN | ZH | 機能 |
| :- | :- | :--- |
| `/check` | `/健檢` | クイックチェック -- メモリ容量、リンク切れ、孤立ファイル、環境状態 |
| `/full-check` | `/大健檢` | 包括的監査 -- `/check` の全項目 + コマンド層、相互参照、Git リポジトリ、環境設定 |
| `/memory-health` | `/記憶健檢` | メモリファイルの行数、更新日、容量警告に特化したチェック |

> Claude の反応がおかしい -> `/check`。週に一度のフルスキャン -> `/full-check`。メモリが満杯に近いか知りたい -> `/memory-health`。3 つとも対象を指定可能、例えば `/check blog` で blog 関連のみチェック。

**検索とメンテナンス** -- ファイル検索 + 緊急復旧

| EN | ZH | 機能 |
| :- | :- | :--- |
| `/memory-search` | `/搜尋記憶` | キーワードで全メモリファイルを横断検索 |
| `/recover` | `/想起來` | 災害復旧 -- ローカルメモリ消失時に GitHub バックアップから復元 |
| `/compact-guide` | `/壓縮建議` | `/compact` をいつ使うべきか、使わないべきかのスマートガイド |

> 「前に何か保存したけどどこだっけ」-> `/memory-search`。新しい PC に移行した、またはメモリが消えた -> `/recover`（事前に `/backup` で GitHub にプッシュしておく必要がある）。会話が長くなって遅い -> `/compact-guide`。

---

## :package: インストール

**ステップ 1** -- メモリバックアップ用の GitHub リポジトリを作成：

> このステップは重要。バックアップリポジトリがないと `/backup`、`/sync`、`/recover` が使えない -- メモリはローカルにしか存在せず、マシンが壊れたら全て失われる。

```bash
# private リポジトリを作成（例："claude-memory"）
gh repo create claude-memory --private

# ローカルにクローン
git clone https://github.com/YOUR_USERNAME/claude-memory.git ~/.claude/claude-memory
```

**ステップ 2** -- ファイルを対応する場所にコピー：

```bash
# hooks スクリプト
cp hooks/*.js ~/.claude/scripts/hooks/

# コマンド
cp commands/*.md ~/.claude/commands/

# Skill 定義（任意 -- Claude が自動的にこの Skill を認識する）
cp -r skill/ ~/.claude/skills/learned/memory-engine/
```

**ステップ 3** -- 必要なディレクトリを作成：

```bash
mkdir -p ~/.claude/sessions/diary
mkdir -p ~/.claude/scripts/hooks
```

**ステップ 4** -- `~/.claude/settings.json` に hooks 設定を追加：

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

**ステップ 5** -- Claude Code を再起動。完了！

---

## :brain: Smart Context：プロジェクトに応じたメモリ自動読み込み

> どのフォルダで作業していても、そのプロジェクトのメモリを自動読み込み。設定不要。

`session-start.js` は `~/.claude/projects/` 配下の全プロジェクトディレクトリを自動スキャンし、作業ディレクトリ（CWD）と照合して対応するメモリファイルを読み込む。

メモリファイルは `~/.claude/projects/{project-id}/memory/` に配置。

---

## :detective: Auto Learn：踏み抜き自動学習

> Claude が壁にぶつかって解決したとき、自動で記録する -- 次回同じミスを繰り返さないために。

`session-end.js` は会話終了時に自動的に会話ログをスキャンし、4 種類の「踏み抜き」パターンを検出する：

| シグナル | 判定方法 | 例 |
| :------ | :------ | :- |
| 5 回以上リトライ | 同一ファイルに同一ツールが 5 回以上呼ばれた | 同じファイルを 6 回 Edit |
| エラー後修正 | エラー発生後、同じ箇所が成功した | build 失敗 -> コード修正 -> build 成功 |
| ユーザー訂正 | ユーザーが「違う」「それじゃない」「戻して」と言った | 「そのファイルじゃない」 |
| 行ったり来たり | 同一ファイルが短期間に繰り返し編集された | CSS を変更してまた戻した |

検出された記録は `~/.claude/skills/learned/auto-pitfall-{date}.md` に保存され、次回セッション開始時に自動で振り返る。

v1.1 では、踏み抜き記録に**解決策**も含まれるようになった -- 同じ会話から成功した修正を自動抽出し、問題と解決策の両方を記録する。

注意：通常の繰り返し操作（例えばファイルの連続読み込みなど）は踏み抜きとしてカウントされない。実際に問題が発生したケースのみ検出する。

---

## :open_file_folder: ファイル構成

```text
claude-memory-engine/
  hooks/
    session-start.js            # 新セッション -> 記憶読み込み + smart-context
    session-end.js              # セッション終了 -> 要約保存 + 踏み抜き検出
    mid-session-checkpoint.js   # 20 メッセージごと -> 中間チェックポイント
    memory-sync.js              # メッセージごと -> クロスセッション同期
    write-guard.js              # ファイル書き込み前 -> 機密ファイル警告
    pre-push-check.js           # git push 前 -> 安全チェック
  commands/
    # 日常操作
    save.md / 存記憶.md          # セッション間のメモリ保存
    reload.md / 讀取.md          # メモリを現在の会話に読み込み
    todo.md / 待辦.md            # クロスプロジェクトタスク追跡
    backup.md / 備份.md          # GitHub にプッシュ
    sync.md / 同步.md            # 双方向同期
    # 反省と学習
    diary.md / 回顧.md           # 振り返り日記
    reflect.md / 反思.md         # パターン分析
    learn.md / 學習.md           # 踏み抜き学習
    # ヘルスチェック
    check.md / 健檢.md           # クイックチェック
    full-check.md / 大健檢.md     # 包括的監査
    memory-health.md / 記憶健檢.md  # メモリ容量チェック
    # 検索と復旧
    memory-search.md / 搜尋記憶.md  # キーワード検索
    recover.md / 想起來.md        # 災害復旧
    compact-guide.md / 壓縮建議.md  # コンテキスト圧縮ガイド
  skill/
    SKILL.md                    # Skill 定義
    references/
      smart-context.md          # CWD とメモリファイルの対応表
      auto-learn.md             # 踏み抜き検出ルール
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
