/* ==========================================================================
   サイト設定（ここ1か所を直せば全ページに反映される）
   - <head> 内で同期ロードし、描画前に <html> へ data-phase 等を付与する
   - ext の値が空文字のリンクは「準備中」として押せない状態になる（site.js initExtLinks）
   ========================================================================== */
window.SAIFF = {
  /* ---- フェーズ（手動フラグ。日付による自動切替はしない） ----
     0: ティザー            … Hero主CTA「最新情報を受け取る」（#follow：X・Discord）
     1: 応募受付            … 「作品を応募する」＋締切カウントダウン
     2: 選考結果発表・チケット販売 … 「チケット先行販売／チケットを買う」＋開催日カウントダウン
     3: 会期中              … 「本日のタイムテーブル」
     4: アーカイブ           … 「受賞作を見る／次回の通知」
     ※ URLに ?phase=0〜4 を付けると、そのタブ内だけプレビューできる（?phase=off で解除） */
  phase: 2,

  /* チケット販売状態（手動で切り替える）
     "off"     … 販売前。/tickets の購入ボタンが「発売情報は X で」になる
     "presale" … 先行支援（CAMPFIRE・2026/10/17〜11/30）。常時CTAは「チケット先行販売」
     "general" … 一般販売（teket・12月〜）。常時CTAは「チケットを買う」
     HTML側は data-sale="off|presale|general"（空白区切りで複数指定可） */
  ticketSale: "presale",

  /* 作品応募の受付状態（フェーズとは独立）
     "soon"   … 受付開始前（12月の受付開始まで）。応募ボタンはグレーアウトし「12月受付開始予定」と表示
     "open"   … 受付中。応募ボタンが FilmFreeway（ext.submit）へ直行する。FilmFreeway 承認後に切り替える
     "closed" … 締切後（2027-03-31 以降）
     HTML側は data-submit="soon|on|off"（open→on、closed→off） */
  submissions: "soon",

  /* セレクション上映（二次選考通過作品の SCARTS での無料上映）の掲載フラグ
     二次選考通過作品の SCARTS 上映は確定（2026-10-12）のため true。各HTMLの <html data-selection="on"> と揃える（JS無効時の表示用）
     HTML側は data-selection="on"（掲載時に出す）／ data-selection="off"（非掲載のときだけ出す） */
  selectionScreening: true,

  /* 各ページが公開される最小フェーズ（未公開フェーズで直接開かれたらトップへ戻す） */
  pageMinPhase: { index: 0, about: 0, sponsors: 0, legal: 0, privacy: 0, supporters: 0, submit: 1, guideline: 1, news: 1, program: 2, tickets: 2, archive: 4 },

  /* ---- 日付 ---- */
  dates: {
    festival: "2027-05-04T10:00:00+09:00",        // 開催日（確定）。10:00＝セレクション上映開始（SCARTS）。劇場開場は 11:30、上映・授賞式は 12:00〜
    crowdfundingEnd: "2026-11-30T23:59:59+09:00", // CAMPFIRE 先行支援の終了
    submitDeadline: "2027-03-31T23:59:59+09:00"   // 応募締切（確定：2027年3月31日 水 23:59 JST）
  },

  /* ---- 外部サービス（CVはすべて外部。サイトは説得と送客に専念） ----
     HTML側は <a data-ext="キー"> と書く。URLはここで一元管理し、UTMも自動付与される */
  ext: {
    submit:       "",                                   // 作品応募（FilmFreeway）。URL未確定のため空＝ボタンは押せない状態。承認後に実URLを入れると有効化される
    discord:      "https://discord.gg/Ve2tQeN7cw",       // クリエイター向け Discord 招待（確定）
    crowdfunding: "",                                   // 先行支援（CAMPFIRE プロジェクトページ。10/17〜11/30）。URL未確定のため空＝ボタンは押せない状態
    tickets:      "",                                   // 一般販売（teket イベントページ。12月公開）。URL未確定のため空＝ボタンは押せない状態
    // ニュースレター（メール配信）・通知フォームは廃止（2026-10-12）。最新情報は X（ext.x）と Discord（ext.discord）に送客する
    // 協賛の問い合わせはフォーム・面談予約ではなく mailto:info@sugoiai.org（sponsors.html と partials/cta-bar.html に直書き。data-ext は使わない）
    // お問い合わせは全種別 mailto:info@sugoiai.org（外部フォームは使わない方針。about#contact・footer に直書き）
    x:            "https://x.com/ykishimotoy"            // X（実行委員長アカウント。公式アカウント開設時に差し替え）
  },

  /* ---- 計測 ----
     Cloudflare Web Analytics を Cloudflare 側の設定で有効化し、自動挿入を使う。
     サイト側に解析タグは置かない（GA4／GTM／Meta Pixel／Plausible 等は追加しないこと）。 */

  /* ---- 多言語（ja + en/fr/de/zh-hans。言語版は tools/i18n.py build が生成。各言語ページは currentLocale を上書きする） ----
     available:true にした言語だけスイッチャーで有効になり、/{code}/ 配下の同名ページへ遷移する */
  locales: [
    { code: "ja",      label: "日本語",   path: "",          available: true  },
    { code: "en",      label: "English",  path: "en/",       available: true  },
    { code: "fr",      label: "Français", path: "fr/",       available: true  },
    { code: "de",      label: "Deutsch",  path: "de/",       available: true  },
    { code: "zh-hans", label: "简体中文", path: "zh-hans/",  available: true  },
    { code: "ko",      label: "한국어",   path: "ko/",       available: true  }
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
  html.setAttribute("data-tickets", /^(off|presale|general)$/.test(S.ticketSale) ? S.ticketSale : "off");
  html.setAttribute("data-submit", S.submissions === "open" ? "on" : S.submissions === "closed" ? "off" : "soon");
  html.setAttribute("data-selection", S.selectionScreening ? "on" : "off");

  // 未公開フェーズのページはトップへ（Coming Soon ページを量産しない）
  var page = html.getAttribute("data-page");
  var min = S.pageMinPhase[page];
  if (typeof min === "number" && S.phase < min) location.replace("index.html");
})(window.SAIFF);
