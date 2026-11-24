#!/usr/bin/env bash
# FastAPI の OpenAPI から TypeScript の型を生成します。--check では差分の検出のみ行います。
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
mkdir -p .cache

(
  cd backend
  uv run --locked python -c \
    'import json; from app.main import app; print(json.dumps(app.openapi(), ensure_ascii=False))'
) > .cache/openapi.json

generate() {
  pnpm --dir frontend exec swagger-typescript-api generate \
    -p ../.cache/openapi.json -o "$1" -n schema.ts --no-client --route-types > /dev/null
}

if [ "${1:-}" = "--check" ]; then
  generate ../.cache/api-check
  if ! diff -u frontend/src/api/schema.ts .cache/api-check/schema.ts; then
    echo "API 型が古くなっています。mise run api:types を実行してください。" >&2
    exit 1
  fi
else
  generate src/api
fi
