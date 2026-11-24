"""README のドキュメント一覧とリポジトリ内の Markdown を照合します。"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEADING = "## ドキュメント一覧"


def repository_documents() -> set[str]:
    output = subprocess.run(
        # 引数は固定で外部入力を含まないため、PATH 上の git を使います。
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "*.md"],  # noqa: S607
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return {path for path in output.splitlines() if (ROOT / path).is_file()}


def listed_documents(readme: str) -> set[str] | None:
    if HEADING not in readme:
        return None
    section = readme.split(HEADING, 1)[1]
    section = re.split(r"^## ", section, maxsplit=1, flags=re.MULTILINE)[0]
    paths: set[str] = set()
    for line in section.splitlines():
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) == 3 and (match := re.fullmatch(r"`([^`]+)`", cells[2])):
            paths.add(match.group(1))
    return paths


def main() -> int:
    listed = listed_documents((ROOT / "README.md").read_text(encoding="utf-8"))
    if listed is None:
        print(f"README.md に「{HEADING}」がありません。", file=sys.stderr)
        return 1

    actual = repository_documents()
    unlisted = sorted(actual - listed)
    missing = sorted(path for path in listed if not (ROOT / path).is_file())
    for path in unlisted:
        print(f"README の一覧に未掲載: {path}", file=sys.stderr)
    for path in missing:
        print(f"README の一覧にあるが存在しない: {path}", file=sys.stderr)
    return 1 if unlisted or missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
