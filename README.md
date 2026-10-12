# 札幌国際AI映画祭 Webサイト

Sapporo International AI Film Festival & Incubation — 2027年5月4日／札幌文化芸術劇場 hitaru・SCARTS（札幌市民交流プラザ）

`concept.md`（コンセプト原文）と `sapporo-ai-film-festival-website-spec.md`（構成・要件定義 v0.2）を元にした、**ビルド不要の完全静的サイト**（素の HTML / CSS / JS、依存ライブラリなし）。最新の確定事項は `saiff-site-fix-requirements-v2.md`（2026-10-04）。

## 見かた

`index.html` をブラウザで直接開けば動く。ローカルサーバーを使う場合：

```sh
python3 -m http.server 8765   # → http://127.0.0.1:8765/
```

## 構成

```
build.py        共通パーツ展開スクリプト（partials/ → 各HTML）
partials/       共通パーツの原本（head-assets／header／footer／cta-bar）
index.html      トップ（振り分けハブ）：Hero／コンセプト短文／3分岐カード／映画祭の構造／#crowdfunding クラファン導線／開催概要／審査員／News／スポンサー／#follow（X・Discord）
about.html      コンセプト（長文の要点）／映画祭の構造／#incubation／#organizer／#contact（mailto）。#press は素材が揃うまでコメントアウト中
submit.html     応募LP：FV（締切・応募料・形式・FilmFreeway Submitボタン）／#criteria（審査の三段階）／#awards／#categories（メインセレクション・応募料・応募本数・スケジュール。「現時点の概要」注記つき）／#jury。#rules 応募条件／#faq（＋#guide FilmFreeway手順）は確定までコメントアウト中
guideline.html  制作ガイドライン（01 AIの使い方〜08 主催者の判断。応募条件から参照）
program.html    #films 劇場上映（カード＋モーダル）／#selection セレクション上映（SCARTS・無料。確定・常時表示）／#talks 講演・トーク／#meetup／#jury／#timetable
tickets.html    #buy 券種・料金（先行支援＝CAMPFIRE／一般販売＝teket・指定席・引換コード）／#notes 注意事項（字幕・座席・受賞作品の公開・キャンセル）／#access／#stay
supporters.html 支援者紹介（種火ナンバー）：ファウンディング／プレミアム／全支援者。データは assets/js/supporters.js
sponsors.html   協賛LP：#why（意義）／#reach／#plans（プラン別の魅力・特典・金額）／#notes／#current／#contact（mailto）
news.html       お知らせ一覧（1ページ完結）
legal.html      #privacy（privacy.html への案内）／#tokusho／#terms
privacy.html    プライバシーポリシー（取得情報・利用目的・アクセス解析について）
archive.html    受賞作・開催記録（Phase 4 で公開）
sitemap.xml / robots.txt
assets/
  css/style.css   デザイントークン＋全スタイル
  js/config.js    ★サイト設定（フェーズ、日付、外部リンク、言語）
  js/data.js      ★共通データ（審査員・登壇者／News／パートナー）
  js/supporters.js ★クラファン支援者（種火ナンバー・表記名・コース）。支援が入るたびに1行追記
  js/site.js      共通スクリプト（ヘッダー、固定CTAバー、カウントダウン、火の粉、モーダル等）
  fonts/          セルフホストWebフォント（woff2・CJKは unicode-range 分割サブセット）
  img/            logo.png（ロゴ原本 500px）／logo-160.png（ヘッダー・フッター用）／favicon.ico・favicon-32.png・apple-touch-icon.png（logo.png から生成）／gekijo01.jpg・gekijo02.jpg（劇場写真）
  video/          hero-loop.mp4 を置くと Hero で無音ループ再生される（未配置）
  docs/           プレスキット・協賛概要PDFの置き場（未配置）
```

## 共通パーツの編集（ヘッダー／フッター／モバイルCTAバー／head共通）
共通パーツは `partials/` にだけ書く。各ページ側は `<!-- @partial header --> … <!-- @/partial header -->` のマーカーで囲まれた自動生成部分なので**直接編集しない**。

```sh
python3 build.py          # partials を全ページに展開（依存なし）
python3 build.py --check  # 展開漏れがあれば exit 1（コミット前・CI用）
```

| ファイル | 内容 |
|---|---|
| `partials/head-assets.html` | favicon・フォント・CSS・config.js の読み込み |
| `partials/header.html` | ヘッダー（ブランド、PC用CTA、ナビ、言語スイッチャー、言語バナー） |
| `partials/footer.html` | フッター |
| `partials/cta-bar.html` | モバイル固定CTAバー |

partial 内では `{{page}}`（ページID）と、行単位のブロック `{{#only submit,tickets}} … {{/only}}`（列挙ページのみ出力）／`{{#except sponsors}} … {{/except}}`（列挙ページを除外）が使える。応募ページ・チケットページのCTAが外部サイトへ直行する、協賛ページのバーがメール問い合わせ（mailto:info@sugoiai.org）になる、といったページ差はこのブロックで表現している。新しいページを作るときは、既存ページからマーカーごとコピーして `build.py` を実行すればよい。

## 運用で触るのは基本この2ファイル

### `assets/js/config.js`
| 設定 | 内容 |
|---|---|
| `phase` | **手動フェーズフラグ**（0 ティザー／1 応募受付／2 チケット販売／3 会期中／4 アーカイブ）。Hero主CTA・カウントダウン対象・ナビ・各LPの表示ブロック・公開ページが一括で切り替わる。現在 **2** |
| `ticketSale` | チケット販売状態。`"off"`（販売前：「先行販売の通知を受け取る」）／`"presale"`（先行販売＝CAMPFIRE：「チケット先行販売」）／`"general"`（一般販売＝teket：「チケットを買う」）。常時CTA・/tickets の購入導線が一括で切り替わる。現在 **presale** |
| `submissions` | 応募受付状態（フェーズと独立）。`"soon"`（受付開始前：応募ボタンはグレーアウトし「12月受付開始予定」。12月の受付開始まで）／`"open"`（受付中：ボタンが FilmFreeway へ直行）／`"closed"`（締切後）。HTML側は `data-submit="soon|on|off"`。現在 **soon**。各HTMLの `<html data-submit>` も揃える（JS無効時用） |
| `selectionScreening` | セレクション上映（二次選考通過作品の SCARTS スタジオ／コート無料上映）の掲載フラグ。上映は確定したため `true`（2026-10-12）。各HTMLの `<html data-selection="on">` と揃えてある。HTML側は `data-selection="on"`（掲載時に出す）／`"off"`（非掲載のときだけ出す） |
| `dates` | 開催日（確定・カウントダウンは劇場開場 11:30）、応募締切（確定：2027-03-31 23:59 JST）、クラファン終了（2026-11-30） |
| `ext` | 外部サービスURLの一元管理（応募＝FilmFreeway `submit`／CAMPFIRE `crowdfunding`／teket `tickets`／Tally／TimeRex／SNS…すべて＜仮＞。実URL確定後に差し替え）。HTML側は `<a data-ext="キー">`。UTMは自動付与 |
| （計測） | **Cloudflare Web Analytics** を Cloudflare 側で有効化・自動挿入。サイト側に解析タグ・Cookie・ストレージなし、同意バナーなし。GA4／GTM／Meta Pixel／Plausible 等は追加しない |
| `locales` | 言語一覧。`available:true` にした言語だけスイッチャーで有効化 |

**フェーズのプレビュー**：URLに `?phase=0`〜`?phase=4` を付けるとそのタブ内だけ切り替わる（左下にプレビューバッジ。`?phase=off` で解除）。未公開フェーズのページを直接開くとトップへ戻る（Coming Soon ページは作らない）。

HTML側の仕組み：`data-show="1 2"` を付けた要素は、そのフェーズのときだけ表示される（CSSのみで切替。JS無効時は Phase 2 の状態で表示）。同様に `data-submit="on|off"`（応募受付）、`data-sale="off|presale|general"`（チケット販売。空白区切りで複数指定可）で表示を切り替える。

### `assets/js/data.js`
審査員・登壇者（トップ／submit#jury／program#jury の3か所で再利用。審査員長：岸本悠佑を掲載。久保俊哉は当面非掲載。img があれば写真を表示）、News（トップ最新3件／news 全件。未来の予定はコメントのまま置き、公開日に date を確定して有効化）、スポンサーロゴ（トップ／sponsors。確定ロゴは data.js の sponsors に { name, img } で追加）。

### `assets/js/supporters.js`
クラウドファンディング支援者の一覧。`{ no, name, tier }` を支援確定順に追記するだけで supporters.html に反映される（`no` 昇順で自動ソート、`tier` は `founding`／`premium`／空）。`updated` を更新日に。公開時から掲載し、少なくとも開催後1年間（2028年5月まで）維持する。

### 運用スケジュールと切替（`saiff-site-fix-requirements-v2.md` §11）
| 時期 | 作業 |
|---|---|
| 10/17〜 | CAMPFIRE 開始。`ext.crowdfunding` を実URLに。支援が入るたびに `supporters.js` に追記。（セレクション上映は確定済みのため切替不要） |
| 11月前半 | 公式サイト公開。`data.js` news 第1報の date を確定。FilmFreeway 申請 |
| 12月 | 作品応募の受付開始（FilmFreeway 承認後）→ `ext.submit` を実URLに、`submissions:"open"` ＋各HTMLの `data-submit="on"` |
| 12月 | teket 公開 → `ext.tickets` を実URLに、`ticketSale:"general"` ＋各HTMLの `data-tickets="general"`。sponsors の実績欄コメントを外す |
| 4/15 | 作品情報・入選発表（program のダミー差し替え） |

## 計測（KPI＝外部送客クリック数）
アクセス解析は **Cloudflare Web Analytics**（Cloudflare 側で有効化・自動挿入。サイト側にスクリプトなし・Cookie／localStorage 不使用・同意バナーなし）。カスタムイベントは送信しない。`data-ext` 付きリンクのクリックは `?phase=N` プレビュー時のみコンソールに `outbound_click` を出力（`ext`／`target`＝creator・audience・sponsor／`pos`／`lang`／`phase`／`page`）。外部送客の実数は、UTM 付きURLで遷移先（CAMPFIRE／teket／Tally 等）側の計測から把握する。UTMは `utm_source=saiff_site&utm_medium=referral&utm_campaign=phase{N}_{lang}&utm_content={page}_{ext}_{pos}`。軸は **言語 × ターゲット × フェーズ**。

## やることメモ（公開前に準備が必要なもの）
- **プレスキット**：ロゴキット（SVG／PNG＋使用ガイドライン）、キービジュアル（横・縦・正方形）、開催概要ファクトシート（PDF）を `assets/docs/` に用意する。揃ったら about.html の `<!-- プレスキット -->` コメントを外し、about の anchor-nav と `partials/footer.html` に `about.html#press` のリンクを戻して `python3 build.py`
- **応募条件・応募手順・FAQ**：submit.html の `#rules`／`#guide`／`#faq` は内容確定までコメントアウト中。確定したらコメントを外し、anchor-nav に「応募条件」「FAQ」、FVのボタンに「応募条件を読む」を戻す
- **札幌滞在ガイド**：tickets.html の `#stay` をコメントアウト中。写真（街並み・桜・食）、5月の気候の確認、おすすめスポットが揃ったらコメントを外し、anchor-nav と meta description に戻す
- **最新情報の配信**：メールのニュースレターは行わない（2026-10-12）。X（@ykishimotoy。公式アカウント開設時に `ext.x` を差し替え）と Discord（`ext.discord` は仮URL）に送客する
- **お問い合わせの方針**：すべて `mailto:info@sugoiai.org` に直行させる（外部フォームは使わない）。新しい問い合わせ導線を足すときもフォームにしない

## ＜仮＞で置いている情報（要確定）
確定：**開催日 2027-05-04／応募締切 2027-03-31 23:59 JST／会場 札幌文化芸術劇場 hitaru（4F・1〜2階席1,686席）＋SCARTS／想定来場 約1,000人／時間割／券種・料金（劇場入場1,000・指定席／オンラインアーカイブ1,000／現地フル参加5,000（2026-10-12 劇場・アーカイブを1,000円に変更。現地フル参加の内訳は要再確認）。通し券・学生券なし）／クラファンは CAMPFIRE で確定／販売（CAMPFIRE 10/17〜11/30 → teket 12月公開・4/15本格販売）／応募料 $10（応募開始 2026年12月）／応募本数 1人1本（最大2本）／応募窓口 FilmFreeway／審査の三段階（4/15発表・本数非公開・「落選」不使用）／受賞作品は開催後オンライン公開（支援者に1週間先行）／二次選考通過作品は SCARTS コート（10:00〜13:00）・スタジオA／B（10:00〜21:00）で上映（確定・10:00開始）・最終選考通過作品は劇場 hitaru で上映／部門名「メインセレクション／Main Selection」（単一部門・ジャンル不問）／協賛メニュー構成（プラチナ3社・ゴールド5社・シルバー・スポンサー（3万円または同等のサービス等の提供）＋招聘スポンサー（1万円／口））・申込締切・データ提出とも 2027-04-25（2026-10-12 変更）／劇場内の協賛表示は企業賞・クロージングクレジット・ホワイエブースの3つのみ。各プランに応じて提供し、条件付き特典はない（施設回答 2026-10-12、`saiff-site-sponsor-requirements-v3.md`）／審査員長 岸本悠佑（久保俊哉は当面非掲載）／主催 札幌国際AI映画祭実行委員会・札幌すごいAI会（非営利）**（2026-10-04 確定。`saiff-site-fix-requirements-v2.md` 参照）。それ以外は仮：

（2026-10-12 時点の未確定一覧）

**本番公開前に必須**
- 外部URL（config.js `ext`）：FilmFreeway（承認後）、CAMPFIRE プロジェクト、teket は未確定のため空文字＝ボタンは「準備中」で押せない状態。実URLを入れると有効化。Discord は確定、note は廃止
- 本番ドメイン `https://www.sapporo-ai.com/`、OGP `assets/img/ogp-1200.jpg`（ogp.png を1200px幅に縮小）、legal／privacy の運営責任者・所在地・制定日（2026-10-12）、guideline の参考リンクは確定済み
- data.js news：10/17 の CAMPFIRE 開始記事はコメントのまま。公開日に有効化
- CAMPFIRE 公開日にやること：`ext.crowdfunding` に実URL、data.js の CAMPFIRE 開始記事を有効化、トップ（ゲート・帯・meta）とチケット・支援者ページの「10月下旬から」「10月下旬開始予定」の文言を「受付中」に戻す。ボタンの2段表示は `btn--stack` と `soon-tag` を外す

**内容が決まり次第**
- 登壇者（data.js で全員コメントアウト中）、ほかの審査員、講演タイトル。index／program／submit のリードに「順次発表」表記あり
- 後援・協力（index 開催概要「＜仮・調整中＞」）
- スポンサー：概要1枚PDF（`assets/docs/saiff-overview.pdf`。リンクはコメントアウト中）、Platinum／Gold／Silver／招聘／後援のロゴ（data.js でコメントアウト中）
- 応募：応募開始日（12月○日）、賞の選出方法（「調整中」表記）。#rules／#guide／#faq はコメントアウト中
- 現地フル参加 5,000円の内訳（劇場1,000円に変更したため旧内訳を削除）
- hitaru 営利切替の料金区分の根拠（施設に再確認。3/20 に成立数確定 → 1社以上なら申請、期限 4/4）
- 交流会のドリンク提供、想定応募数
- コメントアウト中のセクション：about プレスキット、submit 応募条件／手順／FAQ、tickets 札幌滞在ガイド、program ファイナリスト8作品
- 画像：Hero 動画（未配置のままでよい）、実行委員会ロゴは logo.png で代用（このままでよい）
- archive.html（Phase 4 用。全文ダミー）
- 多言語版（ヘッダーの English／Français／Deutsch／简体中文 は「準備中」）
- クラファン支援者リスト（supporters.js は空。10/17 以降に追記）

サイト内では金色の `＜仮＞`（`.tbd`）で明示。`grep -rn "＜" *.html assets/js` で一覧できる。

## 画像プレースホルダー（差し替え箇所）
`class="ph"` の要素がすべて画像プレースホルダー（ラベルに用途と比率を記載）。`<div class="ph …">` を `<img>`（AVIF/WebP推奨）に置き換える。

- Hero：`assets/video/hero-loop.mp4`（無音ループ・数MB）と poster（`assets/img/hero-poster.svg` を差し替え）
- OGP画像：`assets/img/ogp.jpg`（1200×630・未配置）
- 会場写真、コンセプトビジュアル、審査員・登壇者ポートレート(3:4)、実行委員写真(1:1)、主催ロゴ、作品サムネイル(16:9)・予告編、交流会写真、会場地図、札幌滞在ガイド写真、パートナーロゴ、アーカイブ記録写真
- DL資料：`assets/docs/` のロゴキット／キービジュアル／ファクトシート／協賛概要PDF（プレスキット欄は about.html でコメントアウト中。協賛概要PDFのボタンは「準備中」で無効化済み）

## 要件定義からの変更点・未実装
| 項目 | 状態 |
|---|---|
| SSG（Astro推奨） | **素の HTML/CSS/JS に変更**（ユーザー判断）。共通パーツ（head共通・ヘッダー・フッター・モバイルCTAバー）は `partials/` に1か所で持ち、`python3 build.py` で全11ページに展開する（下記「共通パーツの編集」） |
| 5言語展開 | **第1段階は日本語のみ**。言語スイッチャー（他言語は「準備中」表示）、`locales` 設定、初回訪問バナー、同一ページ同一位置への遷移ロジックは実装済み。翻訳パイプライン・用語集・`i18n/*.json` は未作成 |
| 言語の追加手順 | ① `/en/` などのディレクトリに同名HTMLを置く（`<html lang>`、アセットパスを `../assets/` に、`config.js` の `currentLocale` をページ側で上書き）② `locales` の `available` を `true` に ③ 各ページの `hreflang` と `sitemap.xml` に alternate を追加（`x-default` は `/en/`） |
| 映像埋め込みの lite-embed | モーダル内は予告編プレースホルダーのみ（実URL確定後に実装） |
| Git連携CMS | 未導入（データは `data.js` を直接編集） |
| 送信ドメイン認証 | サイト外の作業（SPF／DKIM／DMARC） |

## モバイル（640px以下）の設計方針
- **主CTAは画面下の固定バー**（`.cta-bar`、各HTMLの末尾）：親指の届く位置に常設。ページごとに中身を変える（応募ページ＝応募フォームへ直行、チケットページ＝購入サイトへ直行、協賛ページ＝メール問い合わせ、その他＝フェーズ別CTA）。常時表示（自動で隠さない）。PC用のヘッダーCTA（`.gnav__cta`）はモバイルでは非表示。
- **スマートヘッダー**：下スクロールで退避（`.site-header.is-hidden`）、上スクロールで即再表示。ナビ展開中・ヘッダー内フォーカス時・ページ最上部では常に表示（`site.js` の `initHeader`）。
- **文節単位の折り返し**：中央揃えの見出し・詩行は文節ごとに `<span class="nb">` で囲む（`display:inline-block`）。iOS Safari は `word-break:auto-phrase` 非対応のため必須。PC専用の改行は `<br class="br-pc">`（モバイルで無効化）。長い本文段落は左揃え。
- **ファーストビュー**：`.fv-facts` は「ラベル｜値」の1行×3段に圧縮、ボタンは縦積み・全幅。
- **表**：`table.table--cards` はカード型に変換（`td` の `data-label` がラベルになる）。列が多く横スクロールが残る表は `.table-wrap--scroll` でスクロール可能の注記を出す。
- **1列化**：上映作品カード・賞カードは1列（`:has()` で判定）。

## デザイン
コンセプト「レッドカーペットと、暗闇の中の種火」。ダーク固定、暗色70／赤20／金10。主CTA＝赤地＋アイボリー文字、副CTA＝金の枠線。金は罫線・見出し装飾・賞に限定（ベタ面なし、赤地上の金は見出しのみ）。見出し＝Cormorant Garamond／Noto Serif JP、本文＝Inter／Noto Sans JP（すべてセルフホスト）。火の粉パーティクルは Hero 限定、`prefers-reduced-motion` で停止。JS無効でも本文・ナビ・外部リンク・作品一覧は読める（審査員／News／ロゴの一覧のみJS描画）。
