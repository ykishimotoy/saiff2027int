#!/usr/bin/env python3
"""
共通パーツ（partials/*.html）を各ページに展開する。依存なし・Python 3 標準ライブラリのみ。

  python3 build.py          … 全ページを更新（変更があったファイル名を表示）
  python3 build.py --check  … 更新が必要なページがあれば一覧して exit 1（CI／コミット前チェック用）

各ページには次のマーカーがあり、その内側だけを partials/<name>.html の描画結果で置き換える：

  <!-- @partial header -->
  ...（自動生成。直接編集しない）...
  <!-- @/partial header -->

partial 内で使える記法（行単位）：
  {{page}}                      … ページID（<html data-page="..."> の値）
  {{#only submit,tickets}} … {{/only}}     … 列挙したページにだけ出力
  {{#except submit,tickets}} … {{/except}} … 列挙したページには出力しない
"""
import glob
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARTIALS = ROOT / "partials"
MARK = re.compile(r"(<!-- @partial (\w[\w-]*) -->\n)(.*?)(<!-- @/partial \2 -->)", re.S)
BLOCK = re.compile(r"^\{\{#(only|except) ([\w,-]+)\}\}\n(.*?)^\{\{/\1\}\}\n", re.S | re.M)


def render(name, page):
    src = (PARTIALS / f"{name}.html").read_text(encoding="utf-8")

    def keep(m):
        kind, pages, body = m.group(1), m.group(2).split(","), m.group(3)
        hit = page in pages
        return body if (hit if kind == "only" else not hit) else ""

    out = BLOCK.sub(keep, src)
    assert "{{#" not in out, f"{name}: 閉じられていないブロックがあります"
    return out.replace("{{page}}", page)


def process(path):
    html = path.read_text(encoding="utf-8")
    m = re.search(r'<html[^>]*data-page="([\w-]+)"', html)
    if not m:
        return html, html
    page = m.group(1)

    def sub(mm):
        return mm.group(1) + render(mm.group(2), page) + mm.group(4)

    return html, MARK.sub(sub, html)


def main():
    check = "--check" in sys.argv
    stale = []
    for p in sorted(glob.glob(str(ROOT / "*.html"))):
        path = Path(p)
        before, after = process(path)
        if before != after:
            stale.append(path.name)
            if not check:
                path.write_text(after, encoding="utf-8")
    if check:
        if stale:
            print("partials と食い違っているページ:", ", ".join(stale))
            print("python3 build.py を実行してください")
            sys.exit(1)
        print("OK: 全ページが partials と一致しています")
    else:
        print("更新:", ", ".join(stale) if stale else "なし（すべて最新）")


if __name__ == "__main__":
    main()
