/* ==========================================================================
   サイト設定（ここ1か所を直せば全ページに反映される）
   - <head> 内で同期ロードし、描画前に <html> へ data-phase 等を付与する
   - ＜仮＞ の値は確定次第差し替えること
   ========================================================================== */
window.SAIFF = {
  /* ---- フェーズ（手動フラグ。日付による自動切替はしない） ----
     0: ティザー            … Hero主CTA「最新情報を受け取る」
     1: 応募受付            … 「作品を応募する」＋締切カウントダウン
     2: 入選発表・チケット販売 … 「チケットを買う」＋開催日カウントダウン
     3: 会期中              … 「本日のタイムテーブル」
     4: アーカイブ           … 「受賞作を見る／次回の通知」
     ※ URLに ?phase=0〜4 を付けると、そのタブ内だけプレビューできる（?phase=off で解除） */
  phase: 2,

  /* チケット販売状態。false にすると /tickets の購入ボタンが「発売通知を受け取る」に差し替わる */
  ticketsOnSale: true,

  /* 作品応募の受付状態（フェーズとは独立）。true の間は、全ページの常時CTA（ヘッダー／モバイル下部バー）と
     トップのHero・分岐カード・中盤帯に「作品を応募する」が出る。締切後は false にする */
  submissionsOpen: true,

  /* 各ページが公開される最小フェーズ（未公開フェーズで直接開かれたらトップへ戻す） */
  pageMinPhase: { index: 0, about: 0, partners: 0, legal: 0, privacy: 0, submit: 1, guideline: 1, news: 1, program: 2, tickets: 2, archive: 4 },

  /* ---- 日付 ---- */
  dates: {
    festival: "2027-05-04T10:00:00+09:00",        // 開催日（確定）。開場時刻は＜仮＞
    submitDeadline: "2027-03-31T23:59:59+09:00"   // 応募締切（確定：2027年3月31日 水 23:59 JST）
  },

  /* ---- 外部サービス（CVはすべて外部。サイトは説得と送客に専念） ----
     HTML側は <a data-ext="キー"> と書く。URLはここで一元管理し、UTMも自動付与される */
  ext: {
    submit:       "https://filmfreeway.com/",            // ＜仮＞FilmFreeway 映画祭ページ
    remind:       "https://tally.so/",                   // ＜仮＞締切リマインド登録フォーム
    discord:      "https://discord.com/",                // ＜仮＞クリエイター向けDiscord招待
    tickets:      "https://peatix.com/",                 // ＜仮＞チケット販売ページ
    ticketNotify: "https://tally.so/",                   // ＜仮＞発売通知登録フォーム
    newsletter:   "https://tally.so/",                   // ＜仮＞ニュースレター登録フォーム（?segment= を受け取る）
    sponsorForm:  "https://tally.so/",                   // ＜仮＞協賛資料請求フォーム
    sponsorMeet:  "https://timerex.net/",                // ＜仮＞面談予約
    contact:      "https://tally.so/",                   // ＜仮＞問い合わせフォーム
    x:            "https://x.com/",                      // ＜仮＞公式X
    instagram:    "https://www.instagram.com/",          // ＜仮＞
    youtube:      "https://www.youtube.com/",            // ＜仮＞
    note:         "https://note.com/"                    // ＜仮＞長文レポート掲載先
  },

  /* ---- 計測 ----
     Cloudflare Web Analytics を Cloudflare 側の設定で有効化し、自動挿入を使う。
     サイト側に解析タグは置かない（GA4／GTM／Meta Pixel／Plausible 等は追加しないこと）。 */

  /* ---- 多言語（第1段階は日本語のみ。追加手順は README 参照） ----
     available:true にした言語だけスイッチャーで有効になり、/{code}/ 配下の同名ページへ遷移する */
  locales: [
    { code: "ja",      label: "日本語",   path: "",          available: true  },
    { code: "en",      label: "English",  path: "en/",       available: false },
    { code: "fr",      label: "Français", path: "fr/",       available: false },
    { code: "de",      label: "Deutsch",  path: "de/",       available: false },
    { code: "zh-hans", label: "简体中文", path: "zh-hans/",  available: false }
  ],
  currentLocale: "ja"
};

/* ---- 描画前に <html> へ状態を反映 ---- */
(function (S) {
  var html = document.documentElement;
  html.classList.remove("no-js");
  html.classList.add("js");

  // ?phase=N によるプレビュー（sessionStorage に保持）
  try {
    var q = new URLSearchParams(location.search).get("phase");
    if (q === "off") sessionStorage.removeItem("saiff-phase");
    else if (q !== null && /^[0-4]$/.test(q)) sessionStorage.setItem("saiff-phase", q);
    var ov = sessionStorage.getItem("saiff-phase");
    if (ov !== null) { S.phase = Number(ov); S.phasePreview = true; }
  } catch (e) { /* storage不可でも既定フェーズで動く */ }

  html.setAttribute("data-phase", String(S.phase));
  html.setAttribute("data-tickets", S.ticketsOnSale ? "on" : "off");
  html.setAttribute("data-submit", S.submissionsOpen ? "on" : "off");

  // 未公開フェーズのページはトップへ（Coming Soon ページを量産しない）
  var page = html.getAttribute("data-page");
  var min = S.pageMinPhase[page];
  if (typeof min === "number" && S.phase < min) location.replace("index.html");
})(window.SAIFF);
