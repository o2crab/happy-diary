#!/usr/bin/env bash
# Claude による生成物とロックファイルの手編集を止めます(PreToolUse: Edit|Write)。
# 対象なら終了コード 2 で、正しい更新手順を Claude に伝えます。
set -u

root="$(realpath "${CLAUDE_PROJECT_DIR:?}")"
file="$(python3 -I -c 'import json, sys; print(json.load(sys.stdin).get("tool_input", {}).get("file_path", ""))')" || exit 0
[ -n "$file" ] || exit 0
# 新規ファイルでも判定できるよう、存在しないパスも正規化します。
file="$(python3 -I -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$file")" || exit 0
rel="${file#"$root"/}"

reason=""
case "$rel" in
  frontend/src/api/schema.ts)
    reason="API 型は生成物です。バックエンドを変更してから mise run api:types を実行してください。"
    ;;
  frontend/src/design/tokens/colors.css)
    reason="カラートークンは生成物です。frontend/scripts/gen-color-tokens.ts を変更してから mise run design:tokens を実行してください。"
    ;;
  *.lock | */pnpm-lock.yaml | pnpm-lock.yaml)
    reason="ロックファイルは手で編集しません。uv、pnpm、mise のコマンドで更新してください(mise install はユーザーに依頼)。"
    ;;
esac

[ -z "$reason" ] && exit 0
echo "編集を止めました: $rel — $reason" >&2
exit 2
