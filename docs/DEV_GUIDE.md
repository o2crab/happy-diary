# Happiness Spiral アプリ 開発ガイド

サービス概要と起動手順は [README](../README.md) を参照する。

## アプリ構成

- フロントエンド: React、TypeScript、Vite(`frontend/`)。UI は Material Design 3 に準拠する([デザインシステム](DESIGN_SYSTEM.md))。
- バックエンド: Python、FastAPI、SQLAlchemy(`backend/`)
- DB: SQLite。機能が不足したら本格的な DBMS への移行を検討する。
- API 型: FastAPI の OpenAPI から swagger-typescript-api で `frontend/src/api/schema.ts` を生成する。

テーブルは起動時に `create_all` で作成するため、既存テーブルの変更は反映されない。開発中は `mise run db:reset` で DB を作り直す。本番データを持った後のスキーマ変更は、バックアップを取得して手動 SQL で行う。

## 開発環境

- 言語ランタイムと開発ツールは mise で管理する。バージョンは `mise.toml` と `mise.lock` を正とする。
- コマンドは `mise tasks` で確認し、人、Claude、CI で同じタスクを使う。
- pnpm は mise の環境で実行する。ストア操作ロックの場所(`XDG_RUNTIME_DIR`)を揃えるため。
- シークレットは `.env` に環境変数として記述し、Git の管理対象外とする。雛形は `env.example` を使う。
- `.env` は mise で読み込まず、FastAPI が実行時にのみ読む。
- Docker は CI でのみ使う。

## Lint とフォーマット

TypeScript、JSON、CSS は Biome、Python は Ruff で検査と整形を行う。

- 対象と除外: Ruff はルートの `ruff.toml`、Biome は `frontend/biome.json` を正とし、呼び出し側にはパスを書かない。
- ファイル単位の適用: Claude の編集後とコミット前は、どちらも `scripts/fix-files.sh` を使う。

- 自動整形: エディタ保存時、Claude の編集後、コミット前(Claude の編集後に自動修正できない問題が残れば Claude に伝える)
- 手動修正: `mise run fix`
- 検査のみ: `mise run check`(プッシュ前と CI でも実行)

## Git 運用

- 作業は `feat/*`、`fix/*`、`chore/*`、`docs/*` のブランチで行い、PR で `main` にマージする。
- コミットメッセージには `feat:`、`fix:`、`docs:`、`chore:` などの接頭辞を付ける。
- 管理対象外のファイルは `.gitignore` を正とする。
- `main` はブランチ保護し、PR と CI 成功を必須にする。
- PR は `.github/pull_request_template.md` のチェックリストを埋める。
- PR の作成と CI の確認には GitHub CLI(`gh`、mise で導入)を使う。認証(`gh auth login`)は人が自分のターミナルで行う。`api.github.com` は sandbox の許可ドメインに含めていないため、Claude が `gh` を使うときはコマンドごとに通信の許可を求める。

## Claude を安全に使うために

権限と sandbox の設定は `.claude/settings.json` を正とする。

- 必ずサンドボックス環境内で使用し、許可ドメインは最小限に設定する。
- 編集時は Auto mode に設定し、分類器による安全性の判定を実施させる。
- 承認を求められた場合は、必ず内容を確認してから承認判断を下す。
- `mise.toml`、`lefthook.yml`、`.claude/hooks/`、CI 定義は sandbox の外で実行されることがあるため、特に差分を確認する。
- `git push`、`mise install`、`lefthook install`、`gh auth login` は人が自分のターミナルで実行する。
- 日記は機微な個人情報のため、開発 DB にはダミーデータのみを使い、本番データをローカルへ持ち込まない。Claude は `backend/data/` を読めない設定にしている。

Claude Code のフック(`.claude/hooks/`):

- `guard.sh`: 編集前に、生成物(API 型、カラートークン)とロックファイルの手編集を止め、正しい生成コマンドを伝える。
- `format.sh`: 編集後に自動修正、整形する。
- `verify.sh`: 応答を終える前に、未コミットの変更があれば `mise run check` と `mise run test` を実行し、失敗を Claude に戻す。

Claude 向けの手順とレビュー:

- 機能追加の手順は `add-feature` スキル(`.claude/skills/add-feature/SKILL.md`)にまとめる。
- PR 前のレビューは `reviewer` エージェント(`.claude/agents/reviewer.md`)で行う。

## テスト

- 単体テスト: バックエンドは pytest、フロントエンドは Vitest。`mise run test` で実行する。
- E2E テスト: Playwright(`frontend/e2e/`)。ビルドした画面を FastAPI から配信し、一時 DB で chromium から操作する。`mise run e2e` で実行する。重いため `mise run test` と push 前のフックには含めず、CI で実行する。
- ブラウザは `mise run e2e:install` で `.cache/ms-playwright` に入れる。ダウンロード先が sandbox の許可ドメインにないため、人が自分のターミナルで実行する。

## ドキュメント管理

- 同じ説明を複数の文書に書かず、リンクで参照する。
- 設定値は文書に転記せず、参照先の設定ファイルを示す。
- 変更と同じ PR で文書を更新し、不要になった文書は削除する。
- README の一覧と実ファイルのズレは `mise run docs:check` で検出する。
