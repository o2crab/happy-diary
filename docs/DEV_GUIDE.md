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

## Claude を安全に使うために

権限と sandbox の設定は `.claude/settings.json` を正とする。

- 必ずサンドボックス環境内で使用し、許可ドメインは最小限に設定する。
- 編集時は Auto mode に設定し、分類器による安全性の判定を実施させる。
- 承認を求められた場合は、必ず内容を確認してから承認判断を下す。
- `mise.toml`、`lefthook.yml`、`.claude/hooks/`、CI 定義は sandbox の外で実行されることがあるため、特に差分を確認する。
- `git push`、`mise install`、`lefthook install` は人が自分のターミナルで実行する。
- 日記は機微な個人情報のため、開発 DB にはダミーデータのみを使い、本番データをローカルへ持ち込まない。

## ドキュメント管理

- 同じ説明を複数の文書に書かず、リンクで参照する。
- 設定値は文書に転記せず、参照先の設定ファイルを示す。
- 変更と同じ PR で文書を更新し、不要になった文書は削除する。
- README の一覧と実ファイルのズレは `mise run docs:check` で検出する。
