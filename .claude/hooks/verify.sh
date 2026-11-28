#!/usr/bin/env bash
# Claude が応答を終える前に、変更があれば検査とテストを実行します(Stop)。
# 失敗したら終了コード 2 で結果を Claude に伝え、修正を続けさせます。
set -u

input="$(cat)"
# Stop フックの指摘で続行した後は再実行せず、無限ループを防ぎます。
active="$(printf '%s' "$input" | python3 -I -c 'import json, sys; print(json.load(sys.stdin).get("stop_hook_active", False))' 2>/dev/null)"
[ "$active" = "True" ] && exit 0

root="$(realpath "${CLAUDE_PROJECT_DIR:?}")"
cd "$root" || exit 0
[ -n "$(git status --porcelain 2>/dev/null)" ] || exit 0

for task in check test; do
  if ! output="$(MISE_QUIET=1 mise run "$task" 2>&1)"; then
    {
      echo "mise run $task が失敗しました。修正してから完了してください。"
      printf '%s\n' "$output" | tail -n 40
    } >&2
    exit 2
  fi
done
exit 0
