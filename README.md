# 札幌国際AI映画祭 Webサイト

Sapporo International AI Film Festival & Incubation — 2027年5月4日／札幌文化芸術劇場 hitaru

`concept.md`（コンセプト原文）と `sapporo-ai-film-festival-website-spec.md`（構成・要件定義 v0.2）を元にした、**ビルド不要の完全静的サイト**（素の HTML / CSS / JS、依存ライブラリなし）。

## 見かた

`index.html` をブラウザで直接開けば動く。ローカルサーバーを使う場合：

```sh
python3 -m http.server 8765   # → http://127.0.0.1:8765/
```

## 構成

```
build.py        共通パーツ展開スクリプト（partials/ → 各HTML）
partials/       共通パーツの原本（head-assets／header／footer／cta-bar）
index.html      トップ（振り分けハブ）：Hero／コンセプト短文／3分岐カード／映画祭の構造／開催概要／審査員／News／パートナー／ニュースレター
about.html      コンセプト（長文の要点）／映画祭の構造／#incubation／#organizer／#press／#contact
submit.html     応募LP：FV（締切・賞・形式・応募ボタン）／#criteria／#awards／#categories（単一部門）／#jury／#rules 応募条件／#faq（＋#guide 日本語手順）
guideline.html  制作ガイドライン（01 AIの使い方〜08 主催者の判断。応募条件から参照）
program.html    #films（カード＋モーダル）／#talks／#meetup／#jury／#timetable
tickets.html    #buy 券種・料金／#notes 注意事項（字幕・通訳）／#access／#stay
partners.html   協賛LP：趣旨／#reach／#value（クリエイター接点が主役）／#menu／#current／#contact
news.html       お知らせ一覧（1ページ完結）
legal.html      #privacy（privacy.html への案内）／#tokusho／#terms
privacy.html    プライバシーポリシー（取得情報・利用目的・アクセス解析について）
archive.html    受賞作・開催記録（Phase 4 で公開）
sitemap.xml / robots.txt
assets/
  css/style.css   デザイントークン＋全スタイル
  js/config.js    ★サイト設定（フェーズ、日付、外部リンク、言語）
  js/data.js      ★共通データ（審査員・登壇者／News／パートナー）
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

partial 内では `{{page}}`（ページID）と、行単位のブロック `{{#only submit,tickets}} … {{/only}}`（列挙ページのみ出力）／`{{#except partners}} … {{/except}}`（列挙ページを除外）が使える。応募ページ・チケットページのCTAが外部サイトへ直行する、協賛ページのバーが資料請求＋面談予約になる、といったページ差はこのブロックで表現している。新しいページを作るときは、既存ページからマーカーごとコピーして `build.py` を実行すればよい。

## 運用で触るのは基本この2ファイル

### `assets/js/config.js`
| 設定 | 内容 |
|---|---|
| `phase` | **手動フェーズフラグ**（0 ティザー／1 応募受付／2 チケット販売／3 会期中／4 アーカイブ）。Hero主CTA・カウントダウン対象・ナビ・各LPの表示ブロック・公開ページが一括で切り替わる。現在 **2** |
| `ticketsOnSale` | `false` で /tickets の購入ボタンが「発売通知を受け取る」に差し替わる |
| `submissionsOpen` | 応募受付中フラグ（フェーズと独立）。`true` の間は常時CTA（PCヘッダー／モバイル下部バー）・Hero・分岐カード・中盤帯に「作品を応募する」が並び、/submit は受付中の表示。締切後に `false` |
| `dates` | 開催日（確定）、応募締切（確定：2027-03-31 23:59 JST） |
| `ext` | 外部サービスURLの一元管理（FilmFreeway／Peatix／Tally／TimeRex／SNS…すべて＜仮＞）。HTML側は `<a data-ext="キー">`。UTMは自動付与 |
| （計測） | **Cloudflare Web Analytics** を Cloudflare 側で有効化・自動挿入。サイト側に解析タグ・Cookie・ストレージなし、同意バナーなし。GA4／GTM／Meta Pixel／Plausible 等は追加しない |
| `locales` | 言語一覧。`available:true` にした言語だけスイッチャーで有効化 |

**フェーズのプレビュー**：URLに `?phase=0`〜`?phase=4` を付けるとそのタブ内だけ切り替わる（左下にプレビューバッジ。`?phase=off` で解除）。未公開フェーズのページを直接開くとトップへ戻る（Coming Soon ページは作らない）。

HTML側の仕組み：`data-show="1 2"` を付けた要素は、そのフェーズのときだけ表示される（CSSのみで切替。JS無効時は Phase 2 の状態で表示）。同様に `data-submit="on|off"`（応募受付）、`data-sale="on|off"`（チケット販売）で表示を切り替える。

### `assets/js/data.js`
審査員・登壇者（トップ／submit#jury／program#jury の3か所で再利用）、News（トップ最新3件／news 全件）、パートナーロゴ（トップ／partners）。

## 計測（KPI＝外部送客クリック数）
アクセス解析は **Cloudflare Web Analytics**（Cloudflare 側で有効化・自動挿入。サイト側にスクリプトなし・Cookie／localStorage 不使用・同意バナーなし）。カスタムイベントは送信しない。`data-ext` 付きリンクのクリックは `?phase=N` プレビュー時のみコンソールに `outbound_click` を出力（`ext`／`target`＝creator・audience・sponsor／`pos`／`lang`／`phase`／`page`）。外部送客の実数は、UTM 付きURLで遷移先（FilmFreeway／Peatix／Tally 等）側の計測から把握する。UTMは `utm_source=saiff_site&utm_medium=referral&utm_campaign=phase{N}_{lang}&utm_content={page}_{ext}_{pos}`。軸は **言語 × ターゲット × フェーズ**。

## ＜仮＞で置いている情報（要確定）
確定：**開催日 2027-05-04／応募締切 2027-03-31 23:59 JST／会場 札幌文化芸術劇場 hitaru／主催 札幌国際AI映画祭実行委員会・札幌すごいAI会**。それ以外はすべて仮：

- 開場・終演時刻、タイムテーブル全体、交流会会場
- 会場住所・アクセス情報（＜要確認＞表記。公式情報と照合すること）、5月の気候
- 応募開始日、入選発表日（締切 2027-03-31 は確定）、応募料（現在「無料」）、応募本数、応募プラットフォーム（FilmFreeway か国内フォームか）
- 賞の選出方法（賞名は確定：グランプリ／審査員特別賞／スポンサー特別賞／SAPPORO賞／優秀作品賞。賞金は設けない）、審査員・登壇者（全員「調整中」）、講演・講座タイトル
- 上映作品8本（完全なダミー）、券種・料金、字幕・通訳の方針
- 想定来場・応募数、協賛メニュー構成、協賛申込締切
- 応募条件（#rules）・制作ガイドライン（/guideline）・/legal の全文（**法務確認前ドラフト**）
- 外部サービスURL、SNS、本番ドメイン（`https://saiff.example/`：canonical／OGP／sitemap／JSON-LD に使用）
- 実行委員の氏名・肩書、主催団体の紹介文

サイト内では金色の `＜仮＞`（`.tbd`）で明示。`grep -rn "＜" *.html assets/js` で一覧できる。

## 画像プレースホルダー（差し替え箇所）
`class="ph"` の要素がすべて画像プレースホルダー（ラベルに用途と比率を記載）。`<div class="ph …">` を `<img>`（AVIF/WebP推奨）に置き換える。

- Hero：`assets/video/hero-loop.mp4`（無音ループ・数MB）と poster（`assets/img/hero-poster.svg` を差し替え）
- OGP画像：`assets/img/ogp.jpg`（1200×630・未配置）
- 会場写真、コンセプトビジュアル、審査員・登壇者ポートレート(3:4)、実行委員写真(1:1)、主催ロゴ、作品サムネイル(16:9)・予告編、交流会写真、会場地図、札幌滞在ガイド写真、パートナーロゴ、アーカイブ記録写真
- DL資料：`assets/docs/` のロゴキット／キービジュアル／ファクトシート／協賛概要PDF（ボタンは「準備中」で無効化済み）

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
- **主CTAは画面下の固定バー**（`.cta-bar`、各HTMLの末尾）：親指の届く位置に常設。ページごとに中身を変える（応募ページ＝応募プラットフォームへ直行、チケットページ＝購入サイトへ直行、協賛ページ＝資料請求＋面談予約、その他＝フェーズ別CTA）。常時表示（自動で隠さない）。PC用のヘッダーCTA（`.gnav__cta`）はモバイルでは非表示。
- **スマートヘッダー**：下スクロールで退避（`.site-header.is-hidden`）、上スクロールで即再表示。ナビ展開中・ヘッダー内フォーカス時・ページ最上部では常に表示（`site.js` の `initHeader`）。
- **文節単位の折り返し**：中央揃えの見出し・詩行は文節ごとに `<span class="nb">` で囲む（`display:inline-block`）。iOS Safari は `word-break:auto-phrase` 非対応のため必須。PC専用の改行は `<br class="br-pc">`（モバイルで無効化）。長い本文段落は左揃え。
- **ファーストビュー**：`.fv-facts` は「ラベル｜値」の1行×3段に圧縮、ボタンは縦積み・全幅。
- **表**：`table.table--cards` はカード型に変換（`td` の `data-label` がラベルになる）。列が多く横スクロールが残る表は `.table-wrap--scroll` でスクロール可能の注記を出す。
- **1列化**：上映作品カード・賞カードは1列（`:has()` で判定）。

## デザイン
コンセプト「レッドカーペットと、暗闇の中の種火」。ダーク固定、暗色70／赤20／金10。主CTA＝赤地＋アイボリー文字、副CTA＝金の枠線。金は罫線・見出し装飾・賞に限定（ベタ面なし、赤地上の金は見出しのみ）。見出し＝Cormorant Garamond／Noto Serif JP、本文＝Inter／Noto Sans JP（すべてセルフホスト）。火の粉パーティクルは Hero 限定、`prefers-reduced-motion` で停止。JS無効でも本文・ナビ・外部リンク・作品一覧は読める（審査員／News／ロゴの一覧のみJS描画）。
