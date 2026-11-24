#!/usr/bin/env bash
# Claude が編集したファイルを scripts/fix-files.sh で自動修正、整形します。
# 自動修正できない問題が残った場合は、終了コード 2 で内容を Claude に伝えます(編集自体は取り消されません)。
set -u

root="$(realpath "${CLAUDE_PROJECT_DIR:?}")"
file="$(python3 -I -c 'import json, sys; print(json.load(sys.stdin).get("tool_input", {}).get("file_path", ""))')" || exit 0
[ -n "$file" ] && [ -f "$file" ] || exit 0
file="$(realpath "$file")"
cd "$root" || exit 0

output="$(MISE_QUIET=1 mise exec -- bash scripts/fix-files.sh "$file" 2>&1)" && exit 0
{
  echo "自動修正できない問題が残っています: ${file#"$root"/}"
  printf '%s\n' "$output" | head -n 40
} >&2
exit 2
