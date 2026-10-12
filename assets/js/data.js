/* ==========================================================================
   共通データ（データは1か所、表示は複数ページで再利用）
   - people   … 審査員・登壇者（/ , /submit#jury , /program#jury で表示）。img があれば写真、なければプレースホルダー
   - committee … 実行委員（/about#organizer で表示）。round: true で写真を円形に切り抜く
   - news     … お知らせ（/ に最新3件 , /news に全件）
   - sponsors … スポンサーロゴ（/ , /sponsors で表示）。items は文字列（＜仮＞プレースホルダー）か { name, img, url? }（確定ロゴ）
   ※ 現在はすべて＜仮＞のダミー。確定次第ここだけ差し替える
   ========================================================================== */
window.SAIFF_DATA = {
  people: [
    /* 審査員：審査員長のみ公開（2026-10-12）。ほかの審査員は確定次第ここに追加する */
    { kind: "jury",    role: "審査員長",        name: "岸本悠佑",             title: "株式会社EQUES 北海道支社長",       img: "assets/img/kishimoto-480.jpg" }
    /* 登壇者：確定まで非表示。決まったら以下の形式で追加する（img を付ければ写真表示）
    { kind: "speaker", role: "Speaker",        name: "登壇者 A＜調整中＞", title: "映像作家＜仮＞",                 bio: "AIを実制作に組み込んだワークフローを公開している映像作家。＜仮のプロフィール文＞" },
    { kind: "speaker", role: "Speaker",        name: "登壇者 B＜調整中＞", title: "音楽家／サウンドデザイナー＜仮＞", bio: "映像と音楽の境界で活動。＜仮のプロフィール文＞" },
    { kind: "speaker", role: "Speaker",        name: "登壇者 C＜調整中＞", title: "AIクリエイター＜仮＞",           bio: "講演内の実演パートを担当。＜仮のプロフィール文＞" },
    { kind: "speaker", role: "Moderator",      name: "モデレーター＜調整中＞", title: "実行委員会＜仮＞",            bio: "札幌国際AI映画祭実行委員会メンバー。＜仮のプロフィール文＞" }
    */
  ],

  /* 実行委員：about#organizer に表示。{ role, name, title, img } */
  committee: [
    { role: "実行委員長",         name: "岸本悠佑",   title: "株式会社EQUES 北海道支社長",     img: "assets/img/kishimoto-480.jpg" },
    { role: "広報部長",           name: "内藤紗由里", title: "株式会社desiign 代表取締役",     img: "assets/img/naito-480.jpg" },
    { role: "AIクリエイティブ部長", name: "赤獅子屋",   title: "AIクリエイター",                  img: "assets/img/akajishiya-480.jpg", round: true }
  ],

  /* News：上から新しい順。公開済みの出来事だけを有効にし、未来の予定はコメントのまま残す（公開日に date を確定して有効化）
     カテゴリ：お知らせ／応募／チケット／プログラム／クラウドファンディング（進捗は随時追加） */
  news: [
    /* ▼ 2026-12-xx FilmFreeway 承認後：Submit ボタン有効化・作品募集の本格開始（config.js submissions を "open" に）
    { date: "2026-11-XX", cat: "応募", title: "FilmFreeway での作品応募を受け付けています", body: "応募窓口は FilmFreeway です。応募料は$10。1人1本（最大2本）。応募締切は2027年3月31日 23:59（日本時間）。", link: "submit.html", linkLabel: "応募要項へ" },
    */
    /* ▼ クラウドファンディング進捗（随時。達成率・支援者数・ストレッチ達成などを短く）
    { date: "2026-11-XX", cat: "クラウドファンディング", title: "先行支援が○○人・○○万円に達しました", body: "ご支援ありがとうございます。支援者の皆さまは種火ナンバーとともに支援者紹介ページに掲載しています。", link: "supporters.html", linkLabel: "支援者紹介へ" },
    */
    /* ▼ 第1報（公開日 2026-10-12 確定） */
    { date: "2026-10-12", cat: "お知らせ", title: "公式サイトを公開しました。作品募集は12月に開始します", body: "2027年5月4日、札幌文化芸術劇場 hitaru／SCARTS にて第1回を開催します。作品応募は12月から FilmFreeway で受け付けます（応募料は$10）。チケットの先行支援は10月下旬から CAMPFIRE で受け付けます。", link: "sponsors.html", linkLabel: "スポンサー募集へ" }
    /* ▼ 10/17 CAMPFIRE 公開日に有効化（date を確定し、上の行末にカンマを足す）
    { date: "2026-10-17", cat: "クラウドファンディング", title: "CAMPFIRE で先行支援の受付を開始しました", body: "11月30日まで。劇場入場（1,000円・指定席・先行300席）、オンラインアーカイブ（1,000円）、現地フル参加（劇場入場込み 5,000円・50席限定）。全支援者に種火ナンバーを付与し、支援者紹介ページに掲載します。", link: "tickets.html", linkLabel: "チケット先行販売へ" }
    */
    /* ▼ 以降の予定（ダミー・日付確定後に有効化）
    { date: "2026-12-XX", cat: "チケット", title: "teket でチケットの一般販売ページを公開しました", body: "劇場入場（1,000円・指定席）とオンラインアーカイブ（1,000円）。クラウドファンディング支援者の方には引換コードをお送りしました。本格販売は2027年4月15日からです。", link: "tickets.html", linkLabel: "チケット情報へ" },
    { date: "2027-02-XX", cat: "プログラム", title: "審査員・登壇者を公開しました", body: "第1回の審査員と、クリエイター講演・トークの登壇者を公開しました。", link: "program.html#jury", linkLabel: "審査員・登壇者へ" },
    { date: "2027-04-01", cat: "応募", title: "作品応募の受付を終了しました", body: "たくさんのご応募をありがとうございました。選考結果は4月15日に発表します。", link: "", linkLabel: "" },
    { date: "2027-04-15", cat: "プログラム", title: "最終選考通過作品・二次選考通過作品を発表しました", body: "最終選考通過作品は劇場 hitaru で上映し、各賞の対象となります。", link: "program.html#films", linkLabel: "上映作品を見る" },
    */
  ],

  /* 確定したロゴがあるティアだけ掲載する。ティア名に Platinum／Gold を含むと大きい枠で表示される。
     決まったら下のコメントから該当ティアを戻し、{ name, img, url? } で追加する */
  sponsors: [
    /*
    { tier: "Platinum Sponsors", items: ["協賛企業ロゴ＜仮＞"] },
    { tier: "Gold Sponsors",     items: ["協賛企業ロゴ＜仮＞", "協賛企業ロゴ＜仮＞"] },
    { tier: "Silver Sponsors",   items: ["協賛企業ロゴ＜仮＞", "協賛企業ロゴ＜仮＞", "協賛企業ロゴ＜仮＞"] },
    */
    { tier: "Sponsors", items: [{ name: "AI駆動開発勉強会 札幌支部", img: "assets/img/aiddsapporo-480.png" }] }
    /*
    { tier: "Creator Invitation Sponsors", items: ["協賛企業ロゴ＜仮＞"] },
    { tier: "Support / 後援・協力", items: ["後援団体ロゴ＜仮＞", "後援団体ロゴ＜仮＞", "協力団体ロゴ＜仮＞"] }
    */
  ]
};
