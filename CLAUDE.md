# Claudeが守るべき重要なルール
- Claudeが出力テキストのうちユーザーが読む回答や質問、途中経過報告などは、日本語で出力してください。
- 開発の構成、コマンド、運用ルールは `docs/DEV_GUIDE.md` に従ってください。
- ドキュメントを追加、移動、削除したら、`README.md` のドキュメント一覧も更新してください。
- `docker`、`git push`、`mise install`、`lefthook install` は実行せず、必要な場合はユーザーに依頼してください。

# 完了の定義
次をすべて満たしてから、作業の完了を報告してください。
- `mise run check` と `mise run test` が通る(変更が残っていれば Stop フックでも検査されます)。
- 画面を変えたら `mise run e2e` も通る。
- 新しいふるまいにテストがある。
- 関連する文書を同じブランチで更新している。

# 作業のルール
- 機能を追加するときは `add-feature` スキルの手順に従ってください。
- API を変えたら `mise run api:types` で `frontend/src/api/schema.ts` を再生成してください(手編集しない)。
- UI は `frontend/src/design/components` の部品とトークンを使い、`docs/DESIGN_SYSTEM.md` の書き方のルールに従ってください。
- 開発 DB とテストにはダミーデータだけを使ってください。
- PR を作る前に `reviewer` エージェントで差分を確認してください。
