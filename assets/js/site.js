/* ==========================================================================
   札幌国際AI映画祭 — 共通スクリプト（依存ライブラリなし・最小限）
   JS無効でも本文・ナビ・外部リンクは機能する。ここで足すのは演出と送客計測のみ。
   ========================================================================== */
(function () {
  "use strict";
  var S = window.SAIFF || {};
  var D = window.SAIFF_DATA || {};
  var html = document.documentElement;
  var page = html.getAttribute("data-page") || "index";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------- 計測：外部送客クリック（軸＝言語 × ターゲット × フェーズ） ---------- */
  function track(name, params) {
    params = Object.assign({ lang: S.currentLocale, phase: S.phase, page: page }, params || {});
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    if (typeof window.plausible === "function") window.plausible(name, { props: params });
    if (S.phasePreview) console.info("[track]", name, params);
  }
  function withUtm(url, content) {
    try {
      var u = new URL(url);
      u.searchParams.set("utm_source", "saiff_site");
      u.searchParams.set("utm_medium", "referral");
      u.searchParams.set("utm_campaign", "phase" + S.phase + "_" + S.currentLocale);
      u.searchParams.set("utm_content", content);
      return u.toString();
    } catch (e) { return url; }
  }

  /* ---------- 外部リンク：URLを config から注入＋UTM付与＋クリック計測 ---------- */
  function initExtLinks(root) {
    $$("a[data-ext]", root).forEach(function (a, i) {
      var key = a.getAttribute("data-ext");
      var url = (S.ext || {})[key];
      if (url) a.href = withUtm(url, page + "_" + key + "_" + (a.getAttribute("data-pos") || i));
      a.target = "_blank";
      a.rel = "noopener";
      a.addEventListener("click", function () {
        track("outbound_click", { ext: key, target: a.getAttribute("data-target") || "general", pos: a.getAttribute("data-pos") || "" });
      });
    });
  }

  /* ---------- ヘッダー ---------- */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $(".nav-toggle"), nav = $(".gnav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
      });
      $$("a", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = "";
        });
      });
    }
    // 現在ページのナビを強調
    $$(".gnav__list a").forEach(function (a) {
      if ((a.getAttribute("href") || "").split("#")[0] === page + ".html") a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- 言語スイッチャー：同じページの同じ位置へ。選択は localStorage に保存 ---------- */
  function initLang() {
    var box = $(".lang"), list = $(".lang ul");
    if (!box || !list) return;
    list.textContent = "";
    var file = page + ".html";
    (S.locales || []).forEach(function (loc) {
      var li = h("li");
      if (loc.available) {
        var a = h("a", { href: "#", lang: loc.code, hreflang: loc.code, text: loc.label });
        if (loc.code === S.currentLocale) a.setAttribute("aria-current", "true");
        a.addEventListener("click", function (e) {
          e.preventDefault();
          store("saiff-lang", loc.code);
          if (loc.code === S.currentLocale) { box.removeAttribute("open"); return; }
          // 現在言語のプレフィックスを外し、対象言語のプレフィックスを付ける（ハッシュ＝位置は維持）
          var cur = (S.locales.filter(function (l) { return l.code === S.currentLocale; })[0] || {}).path || "";
          var up = cur ? "../" : "";
          location.href = up + loc.path + file + location.hash;
        });
        li.appendChild(a);
      } else {
        li.appendChild(h("span", { lang: loc.code }, [document.createTextNode(loc.label), h("small", { text: "準備中" })]));
      }
      list.appendChild(li);
    });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) box.removeAttribute("open"); });

    // 初回訪問時のみ：ブラウザ言語と表示言語が違い、かつその言語版が公開済みならバナーを出す（自動リダイレクトはしない）
    var banner = $(".lang-banner");
    if (!banner || store("saiff-lang") || store("saiff-lang-banner")) return;
    var nav = (navigator.language || "").toLowerCase();
    var match = (S.locales || []).filter(function (l) {
      return l.available && l.code !== S.currentLocale && (nav.indexOf(l.code.split("-")[0]) === 0);
    })[0] || (nav.indexOf("ja") !== 0 ? (S.locales || []).filter(function (l) { return l.available && l.code === "en" && S.currentLocale !== "en"; })[0] : null);
    if (!match) return;
    var link = $("a", banner);
    link.textContent = match.label + " version is available →";
    link.href = match.path + file + location.hash;
    link.lang = match.code;
    banner.hidden = false;
    $("button", banner).addEventListener("click", function () { banner.hidden = true; store("saiff-lang-banner", "dismissed"); });
  }

  /* ---------- 共通コンポーネント：審査員・登壇者 ---------- */
  function renderPeople() {
    $$('[data-component="people"]').forEach(function (box) {
      var kind = box.getAttribute("data-kind"); // jury | speaker | (空=全員)
      var limit = Number(box.getAttribute("data-limit")) || 99;
      var withBio = box.hasAttribute("data-bio");
      var list = (D.people || []).filter(function (p) { return !kind || p.kind === kind; }).slice(0, limit);
      box.textContent = "";
      list.forEach(function (p) {
        box.appendChild(h("article", { class: "person reveal" }, [
          h("div", { class: "ph ph--portrait", role: "img", "aria-label": p.name + " の写真（プレースホルダー）", text: "ポートレート写真\n3:4＜プレースホルダー＞" }),
          h("p", { class: "person__role", text: p.role }),
          h("h3", { class: "person__name", text: p.name }),
          h("p", { class: "person__title", text: p.title }),
          withBio ? h("p", { class: "person__bio", text: p.bio }) : null
        ]));
      });
    });
  }

  /* ---------- 共通コンポーネント：News ---------- */
  function renderNews() {
    $$('[data-component="news"]').forEach(function (box) {
      var limit = Number(box.getAttribute("data-limit")) || 999;
      // 現在フェーズより未来の出来事を先出ししない（ダミーデータ用の簡易ガード）
      var minPhaseByCat = { "チケット": 2, "プログラム": 2, "応募": 1 };
      var list = (D.news || []).filter(function (n) { return (minPhaseByCat[n.cat] || 0) <= S.phase; }).slice(0, limit);
      box.textContent = "";
      list.forEach(function (n) {
        var body = h("p", { class: "news-item__body", text: n.body + " " });
        if (n.link) body.appendChild(h("a", { href: n.link, text: n.linkLabel || "詳しく見る" }));
        box.appendChild(h("li", { class: "news-item" }, [
          h("time", { datetime: n.date, text: n.date.replace(/-/g, ".") }),
          h("span", { class: "news-item__cat", text: n.cat }),
          h("h3", { class: "news-item__title", text: n.title }),
          body
        ]));
      });
    });
  }

  /* ---------- 共通コンポーネント：パートナーロゴ ---------- */
  function renderPartners() {
    $$('[data-component="partners"]').forEach(function (box) {
      box.textContent = "";
      (D.partners || []).forEach(function (t, i) {
        box.appendChild(h("p", { class: "tier", text: t.tier }));
        var grid = h("div", { class: i < 2 ? "logos logos--lg" : "logos" });
        if (i < 2) grid.style.maxWidth = i === 0 ? "360px" : "720px";
        grid.style.marginInline = "auto";
        if (i === 0) grid.style.gridTemplateColumns = "1fr";
        if (i === 1) grid.style.gridTemplateColumns = "1fr 1fr";
        t.items.forEach(function (name) {
          grid.appendChild(h("div", { class: "ph ph--logo", role: "img", "aria-label": name, text: name }));
        });
        box.appendChild(grid);
      });
    });
  }

  /* ---------- カウントダウン（フェーズで対象が変わる） ---------- */
  function initCountdown() {
    $$("[data-countdown]").forEach(function (box) {
      var target = new Date((S.dates || {})[box.getAttribute("data-countdown")]).getTime();
      if (!target) return;
      var d = $("[data-d]", box), hh = $("[data-h]", box), m = $("[data-m]", box), s = $("[data-s]", box);
      function pad(n) { return String(n).padStart(2, "0"); }
      function tick() {
        var diff = Math.max(0, target - Date.now());
        d.textContent = Math.floor(diff / 864e5);
        hh.textContent = pad(Math.floor(diff / 36e5) % 24);
        m.textContent = pad(Math.floor(diff / 6e4) % 60);
        s.textContent = pad(Math.floor(diff / 1e3) % 60);
      }
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ---------- Hero：火の粉パーティクル（Hero限定。reduced-motion では停止） ---------- */
  function initEmbers() {
    var cv = $(".hero__embers");
    if (!cv || reduced) return;
    var ctx = cv.getContext("2d"), W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], running = true;
    function resize() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn(initial) {
      return {
        x: W * (.15 + Math.random() * .7), y: initial ? Math.random() * H : H + 10,
        r: .6 + Math.random() * 1.8, vy: .25 + Math.random() * .9, vx: (Math.random() - .5) * .3,
        life: 0, max: 400 + Math.random() * 500, ph: Math.random() * 6.28, hot: Math.random() < .3
      };
    }
    resize();
    var count = Math.round(Math.min(70, W / 18));
    for (var i = 0; i < count; i++) parts.push(spawn(true));
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      parts.forEach(function (p, idx) {
        p.life++; p.y -= p.vy; p.x += p.vx + Math.sin(p.life / 40 + p.ph) * .35;
        var a = Math.sin(Math.min(1, p.life / p.max) * Math.PI) * (.55 + .45 * Math.sin(p.life / 9 + p.ph));
        if (p.life > p.max || p.y < -10) { parts[idx] = spawn(false); return; }
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, p.hot ? "rgba(255,226,160," + a + ")" : "rgba(232,150,70," + a + ")");
        g.addColorStop(.35, "rgba(200,60,30," + a * .45 + ")");
        g.addColorStop(1, "rgba(177,18,31,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.2832); ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    window.addEventListener("resize", resize);
    // 画面外・非表示タブでは止める
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        var was = running; running = es[0].isIntersecting;
        if (running && !was) requestAnimationFrame(frame);
      }).observe(cv);
    }
    document.addEventListener("visibilitychange", function () {
      var was = running; running = !document.hidden;
      if (running && !was) requestAnimationFrame(frame);
    });
    requestAnimationFrame(frame);
  }

  /* ---------- 上映作品モーダル（<dialog>。JS無効時はカード内に全文表示） ---------- */
  function initFilmModal() {
    var dlg = $("#film-modal");
    if (!dlg || typeof dlg.showModal !== "function") { html.classList.add("no-dialog"); $$(".film__more").forEach(function (m) { m.style.display = "block"; }); $$(".film__open").forEach(function (b) { b.style.display = "none"; }); return; }
    var body = $(".modal__body", dlg);
    $$(".film").forEach(function (card) {
      var btn = $(".film__open", card);
      if (!btn) return;
      btn.addEventListener("click", function () {
        body.textContent = "";
        var trailer = h("div", { class: "ph ph--video", role: "img", "aria-label": "予告編（プレースホルダー）", text: "予告編の埋め込み位置（lite-embedで遅延ロード）\n16:9＜プレースホルダー＞" });
        body.appendChild(trailer);
        [".film__cat", ".film__title", ".film__meta", ".film__more"].forEach(function (sel) {
          var n = $(sel, card); if (n) body.appendChild(n.cloneNode(true));
        });
        dlg.showModal();
        track("film_modal_open", { film: ($(".film__title", card) || {}).textContent });
      });
    });
    $(".modal__close", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- 会期中：タイムテーブルの「いま」を強調 ---------- */
  function initTimetableNow() {
    if (S.phase !== 3) return;
    var day = ((S.dates || {}).festival || "").slice(0, 10);
    var now = new Date();
    $$(".timetable li[data-start]").forEach(function (li) {
      var st = new Date(day + "T" + li.getAttribute("data-start") + ":00+09:00");
      var en = new Date(day + "T" + li.getAttribute("data-end") + ":00+09:00");
      if (now >= st && now < en) li.classList.add("is-now");
    });
  }

  /* ---------- ニュースレター：セグメント（創る／観る／支える）を付けて外部フォームへ ---------- */
  function initNewsletter() {
    $$("form[data-ext-form]").forEach(function (form) {
      var url = (S.ext || {})[form.getAttribute("data-ext-form")];
      if (url) form.action = url;
      form.addEventListener("submit", function () {
        var segs = $$("input[name=segment]:checked", form).map(function (i) { return i.value; });
        track("outbound_click", { ext: "newsletter", target: segs.join("+") || "unselected", pos: form.getAttribute("data-pos") || "" });
      });
    });
  }

  /* ---------- Cookie同意（同意後にのみ計測タグをロード） ---------- */
  function loadAnalytics() {
    var a = S.analytics || {};
    if (a.provider === "ga4" && a.ga4Id) {
      var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + a.ga4Id; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", a.ga4Id, { anonymize_ip: true });
    } else if (a.provider === "plausible" && a.plausibleDomain) {
      var p = document.createElement("script"); p.defer = true; p.setAttribute("data-domain", a.plausibleDomain); p.src = "https://plausible.io/js/script.outbound-links.js"; document.head.appendChild(p);
    }
  }
  function initCookie() {
    var bar = $(".cookie");
    var consent = store("saiff-consent");
    if (consent === "accepted") loadAnalytics();
    if (!bar || consent) return;
    bar.hidden = false;
    $$("button[data-consent]", bar).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-consent");
        store("saiff-consent", v); bar.hidden = true;
        if (v === "accepted") loadAnalytics();
      });
    });
  }

  /* ---------- スクロール時のフェードイン（控えめ） ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- フェーズプレビュー用バッジ（?phase=N 使用時のみ） ---------- */
  function initPhasePreview() {
    if (!S.phasePreview) return;
    var names = ["0 ティザー", "1 応募受付", "2 チケット販売", "3 会期中", "4 アーカイブ"];
    var box = h("div", { class: "phase-preview", role: "status" }, [document.createTextNode("PREVIEW phase:")]);
    names.forEach(function (n, i) {
      var a = h("a", { href: "?phase=" + i, title: n, text: String(i) });
      if (i === S.phase) a.setAttribute("aria-current", "true");
      box.appendChild(a);
    });
    box.appendChild(h("a", { href: "?phase=off", text: "解除" }));
    document.body.appendChild(box);
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPeople(); renderNews(); renderPartners();
    initHeader(); initLang(); initExtLinks(); initNewsletter();
    initCountdown(); initEmbers(); initFilmModal(); initTimetableNow();
    initCookie(); initReveal(); initPhasePreview();
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  });
})();
