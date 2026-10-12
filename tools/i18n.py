#!/usr/bin/env python3
"""
多言語ページ生成ツール（依存なし・Python 3 標準ライブラリのみ）

  python3 tools/i18n.py extract   … 日本語ページ（ルートの *.html）と JS から翻訳対象の文字列を集め、
                                     i18n/ja.json（id→原文）と i18n/catalog.json（翻訳者向け・文脈つき）を更新する
  python3 tools/i18n.py build     … i18n/<lang>.json（id→訳文）を使って <lang>/*.html と assets/js/i18n/<lang>.js を生成し、
                                     ルートページの hreflang と sitemap.xml も全言語ぶんに揃える
  python3 tools/i18n.py check     … 訳文のタグ・リンクが原文と一致するか、未翻訳がないかを検査する（生成はしない）

仕組み
  - 翻訳の単位は「ブロック要素の中身（インラインタグを含む innerHTML）」と、alt／title／aria-label／placeholder／
    meta description 等の属性値、<title>、JSON-LD の一部、JS（data.js／site.js）の文字列リテラル。
  - 日本語を含む文字列だけが対象。訳文が無い id は日本語のまま出力し、build 時に警告する。
  - 生成ページは日本語ページの構造をそのまま使い、assets へのパスを ../ に、canonical／og:url／hreflang を言語版に書き換え、
    config.js の直後に currentLocale の上書き、site.js の直前に assets/js/i18n/<lang>.js の読み込みを挿入する。
  - 英・仏・独では <span class="nb">（日本語の文節単位の改行制御）を外す。中国語では残す。
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "i18n"
SITE = "https://www.sapporo-ai.com/"
LOCALES = {
    "en": {"lang": "en", "og": "en_US", "label": "English"},
    "fr": {"lang": "fr", "og": "fr_FR", "label": "Français"},
    "de": {"lang": "de", "og": "de_DE", "label": "Deutsch"},
    "zh-hans": {"lang": "zh-Hans", "og": "zh_CN", "label": "简体中文"},
    "ko": {"lang": "ko", "og": "ko_KR", "label": "한국어"},
}
PAGES = ["index", "about", "submit", "program", "tickets", "sponsors", "supporters", "news", "legal", "privacy", "guideline", "archive"]
SITEMAP_PAGES = ["index", "about", "submit", "program", "tickets", "sponsors", "supporters", "news", "legal", "privacy", "guideline"]

JP = re.compile(r"[぀-ヿ一-鿿！-｠]")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
BLOCK = {
    "html", "head", "body", "div", "section", "header", "footer", "nav", "main", "article", "aside", "ul", "ol", "dl",
    "table", "thead", "tbody", "tfoot", "tr", "figure", "details", "form", "fieldset", "dialog", "blockquote", "address",
    "noscript", "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "dt", "dd", "td", "th", "summary", "legend", "label",
    "button", "figcaption", "title", "script", "style", "svg", "picture", "video", "iframe", "select", "textarea", "option",
}
OPAQUE = {"script", "style", "svg"}
# 入れ物。それ自体は翻訳単位にせず、中の要素／直下のテキストを単位にする
CONTAINER = {
    "html", "head", "body", "div", "section", "header", "footer", "nav", "main", "article", "aside", "ul", "ol", "dl",
    "table", "thead", "tbody", "tfoot", "tr", "figure", "details", "form", "fieldset", "dialog", "blockquote", "address",
    "noscript", "picture", "video", "select",
}
TR_ATTRS = {"alt", "title", "aria-label", "placeholder"}
META_NAMES = {"description", "og:description", "og:title", "og:site_name", "twitter:title", "twitter:description"}
URL_ATTRS = {"href", "src", "poster", "action", "content"}


# ---------------------------------------------------------------- DOM
class Node:
    __slots__ = ("tag", "attrs", "children", "parent", "text", "kind")

    def __init__(self, kind, tag=None, attrs=None, text=""):
        self.kind = kind  # "el" | "text" | "comment" | "doctype"
        self.tag = tag
        self.attrs = attrs or []
        self.children = []
        self.parent = None
        self.text = text

    def get(self, name):
        for k, v in self.attrs:
            if k == name:
                return v
        return None

    def set(self, name, value):
        for i, (k, _) in enumerate(self.attrs):
            if k == name:
                self.attrs[i] = (k, value)
                return
        self.attrs.append((name, value))


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("el", "#root")
        self.cur = self.root

    def handle_decl(self, decl):
        self.cur.children.append(Node("doctype", text=decl))

    def handle_starttag(self, tag, attrs):
        n = Node("el", tag, [(k, "" if v is None else v) for k, v in attrs])
        n.parent = self.cur
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        n = Node("el", tag, [(k, "" if v is None else v) for k, v in attrs])
        n.parent = self.cur
        self.cur.children.append(n)

    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.parent
        if n is not None and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(Node("text", text=data))

    def handle_comment(self, data):
        self.cur.children.append(Node("comment", text=data))


def parse(html):
    tb = TreeBuilder()
    tb.feed(html)
    tb.close()
    return tb.root


def esc_text(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def esc_attr(s):
    return s.replace("&", "&amp;").replace('"', "&quot;")


def serialize(node, opts=None, out=None):
    """opts: {"strip_nb": bool, "translated": {id(node): html}, "drop_comments": bool}"""
    top = out is None
    out = [] if top else out
    o = opts or {}
    if node.kind == "doctype":
        out.append("<!" + node.text + ">")
    elif node.kind == "text":
        out.append(node.text if node.parent is not None and node.parent.tag in ("script", "style") else esc_text(node.text))
    elif node.kind == "comment":
        if not o.get("drop_comments"):
            out.append("<!--" + node.text + "-->")
    else:
        if node.tag != "#root":
            if o.get("strip_nb") and node.tag == "span" and node.get("class") == "nb":
                for c in node.children:
                    serialize(c, o, out)
                return "".join(out) if top else None
            out.append("<" + node.tag)
            for k, v in node.attrs:
                out.append(" " + k + ('="' + esc_attr(v) + '"' if v != "" else ""))
            out.append(">")
        tr = o.get("translated", {}).get(id(node))
        if tr is not None:
            out.append(tr)
        else:
            for c in node.children:
                serialize(c, o, out)
        if node.tag != "#root" and node.tag not in VOID:
            out.append("</" + node.tag + ">")
    return "".join(out) if top else None


def inner_html(node):
    return "".join(serialize(c, {"drop_comments": True}) for c in node.children)


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def text_of(node):
    if node.kind == "text":
        return node.text
    if node.kind != "el":
        return ""
    return "".join(text_of(c) for c in node.children)


def has_block_desc(node):
    for c in node.children:
        if c.kind == "el" and (c.tag in BLOCK or has_block_desc(c)):
            return True
    return False


def walk_units(node, page, units):
    """翻訳単位を集める。units: list of (kind, key, node, ctx)。kind: inner | text | attr"""
    if node.kind != "el":
        return
    if node.tag in OPAQUE:
        return
    # 属性
    for k, v in node.attrs:
        if JP.search(v) and (k in TR_ATTRS or (node.tag == "meta" and k == "content" and (node.get("name") in META_NAMES or node.get("property") in META_NAMES))):
            units.append(("attr", norm(v), (node, k), f"{page} <{node.tag} {k}>"))
    if node.tag in VOID:
        return
    if not has_block_desc(node) and node.tag not in CONTAINER and node.tag != "#root":
        inner = inner_html(node)
        if JP.search(text_of(node)):
            units.append(("inner", norm(inner), node, f"{page} <{node.tag}>"))
        return
    for c in node.children:
        if c.kind == "text":
            if JP.search(c.text):
                units.append(("text", norm(c.text), c, f"{page} text in <{node.tag}>"))
        elif c.kind == "el":
            walk_units(c, page, units)


# ---------------------------------------------------------------- JS 文字列
JS_FILES = ["assets/js/data.js", "assets/js/site.js", "assets/js/supporters.js"]
JS_SKIP = {"0 ティザー", "1 応募受付", "2 チケット販売", "3 会期中", "4 アーカイブ", "解除"}  # 開発用プレビューバー


def js_strings():
    found = []
    for f in JS_FILES:
        src = (ROOT / f).read_text(encoding="utf-8")
        src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
        for line in src.split("\n"):
            code = re.sub(r"(^|\s)//.*", "", line)
            for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', code):
                s = m.group(1).encode("utf-8").decode("unicode_escape").encode("latin-1").decode("utf-8") if "\\" in m.group(1) else m.group(1)
                if JP.search(s) and s not in JS_SKIP:
                    found.append((s, f))
    return found


# ---------------------------------------------------------------- JSON-LD
LD_KEYS = ["name", "description"]


def ld_strings(obj, acc, path="ld"):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in LD_KEYS and isinstance(v, str) and JP.search(v):
                acc.append((v, f"{path}.{k}"))
            else:
                ld_strings(v, acc, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            ld_strings(v, acc, f"{path}[{i}]")


def ld_translate(obj, tr):
    if isinstance(obj, dict):
        return {k: (tr(v) if k in LD_KEYS and isinstance(v, str) else ld_translate(v, tr)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [ld_translate(v, tr) for v in obj]
    return obj


# ---------------------------------------------------------------- catalog
def load_json(p, default):
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default


def collect():
    """全ページ・JS・JSON-LD から (key, ctx) を集める（順序は出現順、重複は最初の文脈）"""
    order, ctx = [], {}

    def add(key, c):
        if key not in ctx:
            order.append(key)
            ctx[key] = c

    for page in PAGES:
        p = ROOT / f"{page}.html"
        if not p.exists():
            continue
        tree = parse(p.read_text(encoding="utf-8"))
        units = []
        walk_units(tree, f"{page}.html", units)
        for kind, key, _, c in units:
            add(key, c)
        for s in find_all(tree, "script"):
            if s.get("type") == "application/ld+json":
                acc = []
                ld_strings(json.loads(text_of(s)), acc)
                for v, c in acc:
                    add(norm(v), f"{page}.html {c}")
    for s, f in js_strings():
        add(s, f)
    return order, ctx


def find_all(node, tag, acc=None):
    acc = [] if acc is None else acc
    if node.kind == "el":
        if node.tag == tag:
            acc.append(node)
        for c in node.children:
            find_all(c, tag, acc)
    return acc


def cmd_extract():
    I18N.mkdir(exist_ok=True)
    ja = load_json(I18N / "ja.json", {})
    by_text = {v: k for k, v in ja.items()}
    order, ctx = collect()
    next_id = max([int(k[1:]) for k in ja] or [0]) + 1
    added = 0
    for key in order:
        if key not in by_text:
            sid = f"s{next_id:04d}"
            next_id += 1
            ja[sid] = key
            by_text[key] = sid
            added += 1
    (I18N / "ja.json").write_text(json.dumps(ja, ensure_ascii=False, indent=1), encoding="utf-8")
    catalog = [{"id": by_text[k], "ctx": ctx[k], "ja": k} for k in order]
    (I18N / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=1), encoding="utf-8")
    stale = [k for k in ja if ja[k] not in ctx]
    print(f"extract: {len(order)} strings ({added} new, {len(stale)} no longer used) -> i18n/ja.json, i18n/catalog.json")


# ---------------------------------------------------------------- build
TAG_RE = re.compile(r"<(/?)([a-zA-Z0-9]+)([^>]*)>")


def tag_signature(html):
    """訳文検査用：タグ名と href/src/class の並び"""
    sig = []
    for m in TAG_RE.finditer(html):
        attrs = dict(re.findall(r'([a-zA-Z-]+)="([^"]*)"', m.group(3)))
        sig.append((m.group(1) + m.group(2).lower(), attrs.get("href", ""), attrs.get("src", ""), attrs.get("class", "")))
    return sig


def check_translation(src, dst):
    if tag_signature(src) != tag_signature(dst):
        a = [t for t in tag_signature(src)]
        b = [t for t in tag_signature(dst)]
        # nb span の増減だけなら許容
        strip = lambda s: [t for t in s if not (t[0] in ("span", "/span") and t[3] == "nb")]
        if strip(a) != strip(b):
            return "tags differ"
    return None


def load_translations(loc, ja):
    tr = load_json(I18N / f"{loc}.json", {})
    by_text = {}
    for sid, text in ja.items():
        if sid in tr and isinstance(tr[sid], str) and tr[sid].strip():
            by_text[text] = tr[sid]
    return by_text


def rewrite_url(v, page, loc):
    if v.startswith("assets/"):
        return "../" + v
    if v.startswith(SITE):
        rest = v[len(SITE):]
        if rest.startswith("assets/"):
            return v
        if rest == "" or rest.endswith(".html"):
            return SITE + loc + "/" + rest
    return v


def build_page(page, loc, by_text, ja_by_text, warnings):
    cfg = LOCALES[loc]
    src = (ROOT / f"{page}.html").read_text(encoding="utf-8")
    tree = parse(src)
    units = []
    walk_units(tree, f"{page}.html", units)
    translated = {}
    missing = 0
    for kind, key, target, ctx in units:
        t = by_text.get(key)
        if t is None:
            missing += 1
            continue
        if kind == "inner":
            err = check_translation(key, t)
            if err:
                warnings.append(f"[{loc}] {ctx}: {err}")
            t2 = re.sub(r'((?:href|src|poster)=")assets/', r"\1../assets/", re.sub(r'(srcset="[^"]*?)(?<![\w/.])assets/', r"\1../assets/", t))
            if loc not in ("zh-hans", "ko"):  # 欧文では文節改行制御の nb を外す（訳文に含まれるぶん）
                t2 = re.sub(r'<span class="nb">(.*?)</span>', r"\1", t2, flags=re.S)
            translated[id(target)] = t2
        elif kind == "text":
            target.text = t
        else:
            node, attr = target
            node.set(attr, t)
    html = find_all(tree, "html")[0]
    html.set("lang", cfg["lang"])
    # URL・パス
    for el in iter_elements(tree):
        for k, v in list(el.attrs):
            if k in URL_ATTRS and v:
                el.set(k, rewrite_url(v, page, loc))
            if k == "srcset":
                el.set(k, ", ".join(rewrite_url(p.strip(), page, loc) for p in v.split(",")))
    # hreflang：既存の alternate を全言語に差し替え
    head = find_all(tree, "head")[0]
    alts = [c for c in head.children if c.kind == "el" and c.tag == "link" and c.get("rel") == "alternate" and c.get("hreflang")]
    pos = head.children.index(alts[0]) if alts else len(head.children)
    for a in alts:
        head.children.remove(a)
    for a in reversed(hreflang_nodes(page)):
        head.children.insert(pos, a)
    for el in find_all(tree, "meta"):
        if el.get("property") == "og:locale":
            el.set("content", cfg["og"])
    # JSON-LD
    for s in find_all(tree, "script"):
        if s.get("type") == "application/ld+json":
            data = json.loads(text_of(s))
            data = ld_translate(data, lambda v: by_text.get(norm(v), v))
            if "url" in data:
                data["url"] = rewrite_url(data["url"], page, loc)
            data["inLanguage"] = cfg["lang"]
            s.children = [Node("text", text="\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n")]
    # config.js の直後に currentLocale、site.js の直前に i18n スクリプト
    for s in find_all(tree, "script"):
        srcv = s.get("src") or ""
        if srcv.endswith("config.js"):
            n = Node("el", "script")
            n.children = [Node("text", text=f'window.SAIFF.currentLocale="{loc}";')]
            n.parent = s.parent
            s.parent.children.insert(s.parent.children.index(s) + 1, Node("text", text="\n"))
            s.parent.children.insert(s.parent.children.index(s) + 2, n)
        if srcv.endswith("site.js"):
            n = Node("el", "script", [("src", f"../assets/js/i18n/{loc}.js")])
            n.parent = s.parent
            s.parent.children.insert(s.parent.children.index(s), n)
            s.parent.children.insert(s.parent.children.index(s), Node("text", text="\n"))
    out = serialize(tree, {"translated": translated, "strip_nb": loc not in ("zh-hans", "ko"), "drop_comments": True})
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out, missing, len(units)


def iter_elements(node, acc=None):
    acc = [] if acc is None else acc
    if node.kind == "el":
        acc.append(node)
        for c in node.children:
            iter_elements(c, acc)
    return acc


def hreflang_nodes(page):
    file = "" if page == "index" else f"{page}.html"
    rows = [("ja", SITE + file)] + [(LOCALES[l]["lang"], SITE + l + "/" + file) for l in LOCALES] + [("x-default", SITE + "en/" + file)]
    nodes = []
    for i, (code, href) in enumerate(rows):
        if i:
            nodes.append(Node("text", text="\n"))
        nodes.append(Node("el", "link", [("rel", "alternate"), ("hreflang", code), ("href", href)]))
    return nodes


def update_root_hreflang(page):
    p = ROOT / f"{page}.html"
    s = p.read_text(encoding="utf-8")
    file = "" if page == "index" else f"{page}.html"
    rows = [("ja", SITE + file)] + [(LOCALES[l]["lang"], SITE + l + "/" + file) for l in LOCALES] + [("x-default", SITE + "en/" + file)]
    block = "\n".join(f'<link rel="alternate" hreflang="{c}" href="{h}">' for c, h in rows)
    new, n = re.subn(r'(?:<link rel="alternate" hreflang="[^"]+" href="[^"]+">\n?)+', block + "\n", s, count=1)
    if n and new != s:
        p.write_text(new, encoding="utf-8")
        return True
    return False


def write_sitemap():
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             "<!-- tools/i18n.py build が生成する。手で編集しない。archive は Phase 4 で SITEMAP_PAGES に追加 -->",
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for page in SITEMAP_PAGES:
        file = "" if page == "index" else f"{page}.html"
        urls = [("ja", SITE + file)] + [(LOCALES[l]["lang"], SITE + l + "/" + file) for l in LOCALES]
        alts = "".join(f'<xhtml:link rel="alternate" hreflang="{c}" href="{h}"/>' for c, h in urls) + f'<xhtml:link rel="alternate" hreflang="x-default" href="{SITE}en/{file}"/>'
        for _, loc in urls:
            lines.append(f"  <url><loc>{loc}</loc>{alts}</url>")
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_js_dict(loc, by_text):
    keys = [s for s, _ in js_strings()]
    seen, d = set(), {}
    for k in keys:
        if k in seen:
            continue
        seen.add(k)
        if k in by_text:
            d[k] = by_text[k]
    (ROOT / "assets/js/i18n").mkdir(parents=True, exist_ok=True)
    body = "/* 生成物（tools/i18n.py build）。手で編集せず i18n/%s.json を直す。JS が描画する文字列（data.js の見出し・役職・ニュース等）の訳 */\n" % loc
    body += "window.SAIFF_I18N = " + json.dumps(d, ensure_ascii=False, indent=1) + ";\n"
    (ROOT / f"assets/js/i18n/{loc}.js").write_text(body, encoding="utf-8")
    return len(d), len(seen)


def cmd_build(check_only=False):
    ja = load_json(I18N / "ja.json", {})
    if not ja:
        sys.exit("i18n/ja.json がありません。先に extract を実行してください")
    ja_by_text = {v: k for k, v in ja.items()}
    warnings = []
    for loc in LOCALES:
        by_text = load_translations(loc, ja)
        if not by_text:
            print(f"[{loc}] 訳文なし（i18n/{loc}.json）: スキップ")
            continue
        total_missing = total_units = 0
        for page in PAGES:
            if not (ROOT / f"{page}.html").exists():
                continue
            out, missing, n = build_page(page, loc, by_text, ja_by_text, warnings)
            total_missing += missing
            total_units += n
            if not check_only:
                (ROOT / loc).mkdir(exist_ok=True)
                (ROOT / loc / f"{page}.html").write_text(out, encoding="utf-8")
        got, n_js = (write_js_dict(loc, by_text) if not check_only else (0, 0))
        print(f"[{loc}] pages: {total_units - total_missing}/{total_units} strings translated" + (f", js: {got}/{n_js}" if not check_only else ""))
    if not check_only:
        changed = [p for p in PAGES if (ROOT / f"{p}.html").exists() and update_root_hreflang(p)]
        write_sitemap()
        print("root hreflang updated:", ", ".join(changed) if changed else "none; sitemap.xml written")
    for w in warnings:
        print("WARN", w)
    if check_only and warnings:
        sys.exit(1)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "extract":
        cmd_extract()
    elif cmd == "build":
        cmd_build()
    elif cmd == "check":
        cmd_build(check_only=True)
    else:
        print(__doc__)
