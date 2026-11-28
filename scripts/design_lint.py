"""フロントエンドの CSS に色の値が直書きされていないかを検査します。

色はデザイントークン(frontend/src/design/tokens/)の CSS 変数で参照します。
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "frontend" / "src"
TOKENS_DIR = SOURCE_DIR / "design" / "tokens"

COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)
RAW_COLOR = re.compile(
    r"(?<![\w-])#[0-9a-fA-F]{3,8}\b"
    r"|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(",
)


def strip_comments(text: str) -> str:
    # 行番号がずれないよう、コメントは改行だけ残して消します。
    return COMMENT.sub(lambda match: "\n" * match.group(0).count("\n"), text)


def find_violations(path: Path) -> list[str]:
    text = strip_comments(path.read_text(encoding="utf-8"))
    relative = path.relative_to(ROOT)
    return [
        f"{relative}:{number}: 色を直書きせず、トークンを参照してください: {line.strip()}"
        for number, line in enumerate(text.splitlines(), start=1)
        if RAW_COLOR.search(line)
    ]


def main() -> int:
    violations = [
        violation
        for path in sorted(SOURCE_DIR.rglob("*.css"))
        if not path.is_relative_to(TOKENS_DIR)
        for violation in find_violations(path)
    ]
    for violation in violations:
        print(violation, file=sys.stderr)
    return 1 if violations else 0


if __name__ == "__main__":
    raise SystemExit(main())
