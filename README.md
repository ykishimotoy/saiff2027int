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
index.html      トップ（振り分けハブ）：Hero／コンセプト短文／3分岐カード／映画祭の構造／開催概要／審査員／News／パートナー／ニュースレター
about.html      コンセプト（長文の要点）／映画祭の構造／#incubation／#organizer／#press／#contact
submit.html     応募LP：FV（締切・賞・応募料・応募ボタン）／#criteria／#awards／#categories／#jury／#rules／#faq（＋#guide 日本語手順）
program.html    #films（カード＋モーダル）／#talks／#meetup／#jury／#timetable
tickets.html    #buy 券種・料金／#notes 注意事項（字幕・通訳）／#access／#stay
partners.html   協賛LP：趣旨／#reach／#value（クリエイター接点が主役）／#menu／#current／#contact
news.html       お知らせ一覧（1ページ完結）
legal.html      #privacy／#cookie／#tokusho／#terms
archive.html    受賞作・開催記録（Phase 4 で公開）
sitemap.xml / robots.txt
assets/
  css/style.css   デザイントークン＋全スタイル
  js/config.js    ★サイト設定（フェーズ、日付、外部リンク、計測、言語）
  js/data.js      ★共通データ（審査員・登壇者／News／パートナー）
  js/site.js      共通スクリプト（送客計測、カウントダウン、火の粉、モーダル等）
  fonts/          セルフホストWebフォント（woff2・CJKは unicode-range 分割サブセット）
  img/            mark.svg（シンボル＜仮＞）／favicon.svg／hero-poster.svg（Heroプレースホルダー）
  video/          hero-loop.mp4 を置くと Hero で無音ループ再生される（未配置）
  docs/           プレスキット・協賛概要PDFの置き場（未配置）
```

## 運用で触るのは基本この2ファイル

### `assets/js/config.js`
| 設定 | 内容 |
|---|---|
| `phase` | **手動フェーズフラグ**（0 ティザー／1 応募受付／2 チケット販売／3 会期中／4 アーカイブ）。Hero主CTA・カウントダウン対象・ナビ・各LPの表示ブロック・公開ページが一括で切り替わる。現在 **2** |
| `ticketsOnSale` | `false` で /tickets の購入ボタンが「発売通知を受け取る」に差し替わる |
| `dates` | 開催日（確定）、応募締切＜仮＞ |
| `ext` | 外部サービスURLの一元管理（FilmFreeway／Peatix／Tally／TimeRex／SNS…すべて＜仮＞）。HTML側は `<a data-ext="キー">`。UTMは自動付与 |
| `analytics` | `ga4`／`plausible`／`none`。Cookie同意後にのみロード |
| `locales` | 言語一覧。`available:true` にした言語だけスイッチャーで有効化 |

**フェーズのプレビュー**：URLに `?phase=0`〜`?phase=4` を付けるとそのタブ内だけ切り替わる（左下にプレビューバッジ。`?phase=off` で解除）。未公開フェーズのページを直接開くとトップへ戻る（Coming Soon ページは作らない）。

HTML側の仕組み：`data-show="1 2"` を付けた要素は、そのフェーズのときだけ表示される（CSSのみで切替。JS無効時は Phase 2 の状態で表示）。

### `assets/js/data.js`
審査員・登壇者（トップ／submit#jury／program#jury の3か所で再利用）、News（トップ最新3件／news 全件）、パートナーロゴ（トップ／partners）。

## 計測（KPI＝外部送客クリック数）
`data-ext` 付きリンクは全件、クリック時に `outbound_click` イベントを送信（`ext`／`target`＝creator・audience・sponsor／`pos`／`lang`／`phase`／`page`）。UTMは `utm_source=saiff_site&utm_medium=referral&utm_campaign=phase{N}_{lang}&utm_content={page}_{ext}_{pos}`。軸は **言語 × ターゲット × フェーズ**。

## ＜仮＞で置いている情報（要確定）
確定：**開催日 2027-05-04／会場 札幌文化芸術劇場 hitaru／主催 札幌国際AI映画祭実行委員会・札幌すごいAI会**。それ以外はすべて仮：

- 開場・終演時刻、タイムテーブル全体、交流会会場
- 会場住所・アクセス情報（＜要確認＞表記。公式情報と照合すること）、5月の気候
- 応募期間・締切（2027-01-31）、入選発表日、部門・尺・形式・字幕要件、応募料、応募本数
- 賞名・賞金、審査員・登壇者（全員「調整中」）、講演・講座タイトル
- 上映作品8本（完全なダミー）、券種・料金、字幕・通訳の方針
- 想定来場・応募数、協賛メニュー構成、協賛申込締切
- 応募規約（#rules）・/legal の全文（**法務確認前ドラフト**）
- 外部サービスURL、SNS、本番ドメイン（`https://saiff.example/`：canonical／OGP／sitemap／JSON-LD に使用）
- 実行委員の氏名・肩書、主催団体の紹介文

サイト内では金色の `＜仮＞`（`.tbd`）で明示。`grep -rn "＜" *.html assets/js` で一覧できる。

## 画像プレースホルダー（差し替え箇所）
`class="ph"` の要素がすべて画像プレースホルダー（ラベルに用途と比率を記載）。`<div class="ph …">` を `<img>`（AVIF/WebP推奨）に置き換える。

- Hero：`assets/video/hero-loop.mp4`（無音ループ・数MB）と poster（`assets/img/hero-poster.svg` を差し替え）
- OGP画像：`assets/img/ogp.jpg`（1200×630・未配置）
- シンボルマーク `assets/img/mark.svg` は仮デザイン（月桂樹＋種火）
- 会場写真、コンセプトビジュアル、審査員・登壇者ポートレート(3:4)、実行委員写真(1:1)、主催ロゴ、作品サムネイル(16:9)・予告編、交流会写真、会場地図、札幌滞在ガイド写真、パートナーロゴ、アーカイブ記録写真
- DL資料：`assets/docs/` のロゴキット／キービジュアル／ファクトシート／協賛概要PDF（ボタンは「準備中」で無効化済み）

## 要件定義からの変更点・未実装
| 項目 | 状態 |
|---|---|
| SSG（Astro推奨） | **素の HTML/CSS/JS に変更**（ユーザー判断）。そのためヘッダー／フッター／ニュースレターは各HTMLに同一内容を複製している。変更時は全9ファイルを一括置換すること |
| 5言語展開 | **第1段階は日本語のみ**。言語スイッチャー（他言語は「準備中」表示）、`locales` 設定、初回訪問バナー、同一ページ同一位置への遷移ロジックは実装済み。翻訳パイプライン・用語集・`i18n/*.json` は未作成 |
| 言語の追加手順 | ① `/en/` などのディレクトリに同名HTMLを置く（`<html lang>`、アセットパスを `../assets/` に、`config.js` の `currentLocale` をページ側で上書き）② `locales` の `available` を `true` に ③ 各ページの `hreflang` と `sitemap.xml` に alternate を追加（`x-default` は `/en/`） |
| 映像埋め込みの lite-embed | モーダル内は予告編プレースホルダーのみ（実URL確定後に実装） |
| Git連携CMS | 未導入（データは `data.js` を直接編集） |
| 送信ドメイン認証 | サイト外の作業（SPF／DKIM／DMARC） |

## デザイン
コンセプト「レッドカーペットと、暗闇の中の種火」。ダーク固定、暗色70／赤20／金10。主CTA＝赤地＋アイボリー文字、副CTA＝金の枠線。金は罫線・見出し装飾・賞に限定（ベタ面なし、赤地上の金は見出しのみ）。見出し＝Cormorant Garamond／Noto Serif JP、本文＝Inter／Noto Sans JP（すべてセルフホスト）。火の粉パーティクルは Hero 限定、`prefers-reduced-motion` で停止。JS無効でも本文・ナビ・外部リンク・作品一覧は読める（審査員／News／ロゴの一覧のみJS描画）。
