#!/usr/bin/env bash
# 渡されたファイルを、拡張子に応じて Ruff または Biome で自動修正、整形します。
# 対象と除外は ruff.toml と frontend/biome.json で決まります。
# 自動修正できない問題が残った場合は、その内容を出力して失敗します。
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
python_files=()
web_files=()

for arg in "$@"; do
  [ -f "$arg" ] || continue
  path="$(realpath "$arg")"
  # Ruff の force-exclude は .gitignore に効かないため、Git が無視するファイルはここで除きます。
  git -C "$root" check-ignore -q -- "$path" 2>/dev/null && continue
  case "$path" in
    "$root"/*.py)
      python_files+=("$path")
      ;;
    "$root"/frontend/*.ts | "$root"/frontend/*.tsx | "$root"/frontend/*.js | "$root"/frontend/*.jsx | "$root"/frontend/*.json | "$root"/frontend/*.css)
      web_files+=("$path")
      ;;
  esac
done

status=0

if [ "${#python_files[@]}" -gt 0 ]; then
  (
    cd "$root" || exit 1
    rc=0
    uv run --project backend --locked ruff check --fix --quiet --output-format concise -- "${python_files[@]}" || rc=1
    uv run --project backend --locked ruff format --quiet -- "${python_files[@]}" || rc=1
    exit "$rc"
  ) || status=1
fi

if [ "${#web_files[@]}" -gt 0 ]; then
  (
    cd "$root/frontend" || exit 1
    pnpm exec biome check --write --colors=off --no-errors-on-unmatched -- "${web_files[@]}"
  ) || status=1
fi

exit "$status"
