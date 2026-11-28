---
name: add-feature
description: Happiness Spiral に機能(DB モデル、API、画面)を追加する手順。仮説、検証方法、日々の記録、振り返りなどの新機能や、既存機能へのフィールド追加、API 追加、画面追加を行うときに使う。
---

# 機能追加の手順

バックエンドから画面まで縦に通して実装する。各段階でテストを書き、最後に検査をまとめて通す。
構成と運用は `docs/DEV_GUIDE.md`、UI の規約は `docs/DESIGN_SYSTEM.md` を正とする。

## 1. 仕様を決める

- 何を保存し、どの画面で何をできるようにするかを箇条書きにする。曖昧な点はユーザーに確認する。
- 1 つのブランチ(`feat/*`)で扱う範囲は、1 つの PR で確認できる大きさにする。

## 2. DB モデル

- SQLAlchemy 2 の `Mapped` / `mapped_column` で、`backend/app/db.py` の `Base` を継承して定義する。
- テーブルは起動時の `create_all` で作られ、既存テーブルの変更は反映されない。列を変えたら `mise run db:reset` で開発 DB を作り直す(ユーザーに伝える)。
- 日時は UTC で保存し、表示時に変換する。

## 3. API

- リクエスト、レスポンスは Pydantic モデルで定義し、ORM のモデルをそのまま返さない。
- パスは `/api/...`、各エンドポイントに `operation_id`(例: `listHypotheses`)と `response_model` を付ける。型生成の名前になる。
- DB には `request.app.state.engine` からセッションを作って接続する(`backend/app/main.py` の `get_health` を参照)。
- 日記の本文などの個人データをログや例外メッセージに出さない。

## 4. バックエンドのテスト

- `backend/tests/test_health.py` と同じく、`tmp_path` の一時 SQLite で `create_app(Settings(database_url=...))` を作り、`TestClient` で呼ぶ。
- 正常系、入力検証エラー(422)、存在しない ID(404)を確認する。データはダミーにする。

## 5. API 型の生成

- `mise run api:types` で `frontend/src/api/schema.ts` を再生成する。手で編集しない(フックが止める)。

## 6. 画面

- 部品は `frontend/src/design/components` のものを使う。足りない部品は DESIGN_SYSTEM の「部品の追加手順」で追加し、`Gallery.tsx` に載せる。
- 色、余白、文字、角丸などはトークンを参照し、直書きしない(`mise run design:lint` が検出する)。
- API の型は `frontend/src/api/schema.ts` から import する。
- 文言は日本語にする。

## 7. フロントエンドのテスト

- Vitest と Testing Library で、ロールとラベルで要素を特定してテストする。`fetch` はテスト内でモックする。
- 主要な利用の流れは `frontend/e2e/` に Playwright のテストを足す。

## 8. 仕上げ

- `mise run check`、`mise run test`、`mise run e2e` を通す。
- 文書(DEV_GUIDE、DESIGN_SYSTEM、README)の更新が必要か確認する。
- `reviewer` エージェントで差分を確認し、指摘を直す。
- コミットメッセージは `feat:` などの接頭辞を付ける。`git push` はユーザーに依頼する。
