# 翻訳ブリーフ／用語集（Sapporo International AI Film Festival 公式サイト）

対象：`i18n/catalog.json`（881 entries）。各 entry の `ja` を訳し、`{ "<id>": "<訳文>" }` の JSON を `i18n/<lang>.json` に書く。

## 絶対に守ること

1. **HTMLタグと属性は原文どおり残す**。`<a href="…">`, `<span class="nb">`, `<span class="tbd">`, `<strong>`, `<b>`, `<br>`, `<small>`, `<em>`, `<img …>`, `<time datetime="…">` など。タグ名・href・src・class を変えない。タグの順序と数も変えない。`<span class="nb">…</span>` は日本語の改行制御用で、訳文では **同じ数だけ残し、中身を訳文の区切りに合わせて分け直してよい**（英独仏では生成時に自動で外される）。
2. **訳さないもの**：固有名詞（hitaru, SCARTS, CAMPFIRE, teket, FilmFreeway, Discord, X, ChatGPT, Cloudflare, YouTube, note, EQUES, desiign, Noto 等）、URL、メールアドレス、`mailto:` の中身、数字、`$10`、時刻、`data-*`、`＜` `＞` の記号自体（中身は訳す）。
3. **文字列の構造を保つ**：`＜仮・調整中＞` のような山括弧のプレースホルダーは `＜TBC – under coordination＞` のように山括弧を残して中身を訳す。`／` `｜` `―` `→` `✓` `↗` `✉` などの記号は、西洋語では ` / `, ` | `, ` — `, `→` に置き換えてよい（意味が同じなら）。
4. **JSON として有効**であること。キーは id（例 `"s0001"`）、値は文字列。`"` は `\"` にエスケープ。881 entries すべてに値を入れる（空文字にしない）。
5. **文体**：映画祭の公式サイト。格調があり、熱量のあるコピーライティング。見出しやタグラインは直訳より「同じ力を持つ表現」を優先。本文は丁寧だが堅苦しくない。フランス語は vouvoiement、ドイツ語は Sie。中国語（简体）は「您」を基本に、見出しは簡潔に。
6. 長さ：ナビやボタンのラベル（`<a href="about.html">理念</a>` 等）は短く。ボタン内の2段目（`<span class="soon-tag">12月受付開始予定</span>`）も短く。
7. 日付・金額の表記は各言語の慣習に（英：May 4, 2027 (Tue, holiday) / ¥1,000 ／ 仏：4 mai 2027 (mar., jour férié) / 1 000 ¥ ／ 独：4. Mai 2027 (Di., Feiertag) / 1.000 ¥ ／ 中：2027年5月4日（周二·节假日）/ 1,000日元）。
8. 「正文は日本語版および英語版」の文（legal／privacy）：英語版では「The Japanese and English versions are the authoritative texts」、他言語では「本ページは参考訳であり、日本語版・英語版が正文」の意味になるように訳す。guideline は「日本語版が正文」。

## 固定訳（必ずこれを使う）

| 日本語 | English | Français | Deutsch | 简体中文 |
|---|---|---|---|---|
| 札幌国際AI映画祭 | Sapporo International AI Film Festival | Sapporo International AI Film Festival（固有名。説明時は « festival international du film IA de Sapporo »） | Sapporo International AI Film Festival（固有名。説明時は „Internationales KI-Filmfestival Sapporo“） | 札幌国际AI电影节 |
| 札幌国際AI映画祭実行委員会 | Sapporo International AI Film Festival Executive Committee | Comité exécutif du Sapporo International AI Film Festival | Organisationskomitee des Sapporo International AI Film Festival | 札幌国际AI电影节执行委员会 |
| 札幌すごいAI会 | Sapporo Sugoi AI Kai | Sapporo Sugoi AI Kai | Sapporo Sugoi AI Kai | 札幌超厉害AI会（Sapporo Sugoi AI Kai） |
| 札幌すごいAIまつり | Sapporo Sugoi AI Matsuri | Sapporo Sugoi AI Matsuri | Sapporo Sugoi AI Matsuri | 札幌超厉害AI祭 |
| 札幌文化芸術劇場 hitaru | Sapporo Cultural Arts Theater hitaru | Théâtre des arts et de la culture de Sapporo hitaru | Sapporo Cultural Arts Theater hitaru | 札幌文化艺术剧场 hitaru |
| 札幌文化芸術交流センター SCARTS | Sapporo Cultural Arts Community Center SCARTS | Centre d'échanges culturels et artistiques de Sapporo SCARTS | Sapporo Cultural Arts Community Center SCARTS | 札幌文化艺术交流中心 SCARTS |
| 札幌市民交流プラザ | Sapporo Community Plaza | Sapporo Community Plaza | Sapporo Community Plaza | 札幌市民交流广场 |
| 劇場 hitaru | the hitaru theater | le théâtre hitaru | das Theater hitaru | hitaru 剧场 |
| SCARTS コート／スタジオA・B／モール | SCARTS Court / Studio A & B / Mall | SCARTS Court / Studios A et B / Mall | SCARTS Court / Studio A & B / Mall | SCARTS 中庭（Court）/ 工作室A·B / 商业街（Mall） |
| ホワイエ | foyer | foyer | Foyer | 前厅 |
| 理念（ナビ） | Philosophy | Philosophie | Leitbild | 理念 |
| プログラム | Program | Programme | Programm | 节目 |
| チケット | Tickets | Billets | Tickets | 门票 |
| 作品応募 | Call for Entries | Appel à films | Einreichung | 作品征集 |
| スポンサー募集 | Sponsors | Sponsors | Sponsoren | 赞助招募 |
| 支援者 | Supporters | Soutiens | Unterstützer | 支持者 |
| お知らせ | News | Actualités | Aktuelles | 公告 |
| 物語を浴びる。創造力を知る。未来を起動する。（3本柱） | Bathe in Stories. Know Your Creativity. Ignite the Future. | Se laisser submerger par les histoires. Découvrir sa créativité. Allumer l'avenir. | In Geschichten eintauchen. Die eigene Kreativität erkennen. Die Zukunft zünden. | 沉浸于故事。认识创造力。启动未来。 |
| 物語を解き放て。魂を揺さぶれ。種火はもう、その手にある。 | Unleash your story. Shake the soul. The ember is already in your hands. | Libérez votre histoire. Faites vibrer les âmes. La braise est déjà entre vos mains. | Entfessle deine Geschichte. Erschüttere die Seele. Die Glut liegt schon in deiner Hand. | 释放你的故事。撼动灵魂。火种，已在你手中。 |
| 種火 | ember | braise | Glut | 火种 |
| 種火ナンバー | Ember Number | numéro Braise | Glut-Nummer | 火种编号 |
| あなたは何を創る？ 見せてくれ。全部見届けるから。 | What will you create? Show us. We'll watch every single one. | Qu'allez-vous créer ? Montrez-le-nous. Nous verrons tout, jusqu'au bout. | Was wirst du erschaffen? Zeig es uns. Wir sehen uns alles an. | 你要创作什么？让我们看看。我们会看完每一部。 |
| 創る力が、誰もにひらかれた。 | The power to create is now open to everyone. | Le pouvoir de créer s'ouvre à tous. | Die Kraft zu erschaffen steht nun allen offen. | 创造的力量，向所有人敞开。 |
| 祝祭の炎 | a festival flame / the flame of celebration | la flamme de la fête | die Flamme des Fests | 庆典之火 |
| 劇場上映・授賞式 | Theater Screening & Awards Ceremony | Projection en salle et cérémonie de remise des prix | Kinovorführung & Preisverleihung | 剧场放映·颁奖典礼 |
| セレクション上映 | Selection Screening | Projection de la sélection | Selection Screening (Auswahlvorführung) | 入选作品放映 |
| クリエイター講演・トーク | Creator Talks | Conférences et talks de créateurs | Creator Talks | 创作者讲座·对谈 |
| 交流会 | Networking Reception | Soirée de rencontres | Networking-Empfang | 交流会 |
| 二次選考通過（作品） | Second Selection (films) | deuxième sélection | zweite Auswahlrunde | 二次评选入选（作品） |
| 最終選考通過（ファイナリスト） | Final Selection (Finalists) | sélection finale (finalistes) | Endauswahl (Finalisten) | 最终入选（入围作品） |
| 一次審査 | first-round review | premier tour | erste Sichtung | 初审 |
| グランプリ | Grand Prix | Grand Prix | Grand Prix | 大奖 |
| 審査員特別賞 | Jury Prize | Prix du jury | Preis der Jury | 评审特别奖 |
| 企業賞 | Sponsor Prize | Prix des sponsors | Sponsorenpreis | 企业奖 |
| SAPPORO賞 | SAPPORO Prize | Prix SAPPORO | SAPPORO-Preis | SAPPORO奖 |
| 優秀賞 | Excellence Award | Prix d'excellence | Auszeichnung für herausragende Leistung | 优秀奖 |
| 審査員長 | Jury President | Président du jury | Juryvorsitzender | 评审团主席 |
| 審査員・登壇者 | Jury & Speakers | Jury et intervenants | Jury & Referenten | 评审与嘉宾 |
| 実行委員／実行委員長／広報部長／AIクリエイティブ部長 | Executive Committee / Chair / Head of PR / Head of AI Creative | Comité exécutif / Président / Responsable communication / Responsable création IA | Organisationskomitee / Vorsitzender / Leiterin PR / Leiter AI Creative | 执行委员 / 执行委员长 / 宣传部长 / AI创意部长 |
| 岸本悠佑／内藤紗由里／赤獅子屋 | Yusuke Kishimoto / Sayuri Naito / Akajishiya | 同左 | 同左 | 岸本悠佑 / 内藤纱由里 / 赤狮子屋 |
| 株式会社EQUES 北海道支社長 | Head of Hokkaido Branch, EQUES Inc. | Directeur de la succursale de Hokkaido, EQUES Inc. | Leiter der Niederlassung Hokkaido, EQUES Inc. | EQUES株式会社 北海道分公司负责人 |
| 株式会社desiign 代表取締役 | CEO, desiign Inc. | PDG, desiign Inc. | Geschäftsführerin, desiign Inc. | desiign株式会社 代表董事 |
| AI駆動開発勉強会 札幌支部 | AI-Driven Development Study Group, Sapporo Chapter | Groupe d'étude du développement piloté par l'IA – section de Sapporo | Studiengruppe für KI-gestützte Entwicklung – Sektion Sapporo | AI驱动开发学习会 札幌分部 |
| プラチナ／ゴールド／シルバー／スポンサー（プラン名） | Platinum / Gold / Silver / Sponsor | Platine / Or / Argent / Sponsor | Platin / Gold / Silber / Sponsor | 白金 / 黄金 / 白银 / 赞助商 |
| クリエイター招聘スポンサー／クリエイター招聘基金 | Creator Invitation Sponsor / Creator Invitation Fund | Sponsor d'invitation des créateurs / Fonds d'invitation des créateurs | Creator-Einladungssponsor / Creator-Einladungsfonds | 创作者邀请赞助商 / 创作者邀请基金 |
| スポンサーセッション | Sponsor Session | Session sponsor | Sponsor-Session | 赞助商专场 |
| クロージングクレジット | closing credits | générique de clôture | Abspann (Closing Credits) | 片尾致谢字幕 |
| ループ上映内CM | commercial within the screening loop | spot publicitaire dans la boucle de projection | Werbespot in der Vorführschleife | 循环放映中的广告 |
| ホワイエのブース | foyer booth | stand dans le foyer | Stand im Foyer | 前厅展位 |
| ファウンディングサポーター／プレミアムサポーター | Founding Supporter / Premium Supporter | Founding Supporter / Premium Supporter | Founding Supporter / Premium Supporter | 创始支持者 / 高级支持者 |
| クラウドファンディング／先行支援／先行販売 | crowdfunding / early support / presale | financement participatif / soutien anticipé / prévente | Crowdfunding / Vorab-Unterstützung / Vorverkauf | 众筹 / 先行支持 / 预售 |
| 一般販売 | general sale | vente générale | regulärer Verkauf | 公开销售 |
| 劇場入場（指定席） | Theater Admission (reserved seat) | Entrée au théâtre (place numérotée) | Theatereintritt (nummerierter Sitzplatz) | 剧场门票（对号入座） |
| オンラインアーカイブ | Online Archive | Archives en ligne | Online-Archiv | 线上回放 |
| 現地フル参加 | Full Access (on-site) | Accès complet sur place | Full Access (vor Ort) | 现场全程参与 |
| 通し券／学生券 | day pass / student ticket | pass journée / tarif étudiant | Tageskarte / Studententicket | 通票 / 学生票 |
| 応募料 | entry fee | frais d'inscription | Einreichgebühr | 报名费 |
| 応募締切 | submission deadline | date limite | Einsendeschluss | 投稿截止 |
| 制作ガイドライン | Production Guidelines | Directives de production | Produktionsrichtlinien | 制作指南 |
| 法的表記／特定商取引法に基づく表記 | Legal Notice / Disclosure under the Act on Specified Commercial Transactions | Mentions légales / Mentions au titre de la loi japonaise sur les transactions commerciales spécifiées | Impressum / Angaben gemäß dem japanischen Gesetz über spezifizierte Handelsgeschäfte | 法律声明 / 根据《特定商业交易法》的标示 |
| プライバシーポリシー | Privacy Policy | Politique de confidentialité | Datenschutzerklärung | 隐私政策 |
| 準備中 | Coming soon | Bientôt | Demnächst | 准备中 |
| 12月受付開始予定 | Opens in December | Ouverture en décembre | Start im Dezember | 预计12月开放 |
| 10月下旬開始予定 | Opens late October | Fin octobre | Ab Ende Oktober | 预计10月下旬开始 |
| ＜仮＞／＜調整中＞／＜順次発表＞ | ＜TBC＞ / ＜under coordination＞ / ＜to be announced＞ | ＜à confirmer＞ / ＜en cours＞ / ＜annonce à venir＞ | ＜vorläufig＞ / ＜in Abstimmung＞ / ＜wird bekannt gegeben＞ | ＜暂定＞ / ＜调整中＞ / ＜陆续公布＞ |
| 2027年5月4日（火・祝） | May 4, 2027 (Tue, national holiday) | 4 mai 2027 (mardi, jour férié) | 4. Mai 2027 (Di., Feiertag) | 2027年5月4日（周二·节假日） |
| 日本語・英語の2言語字幕 | Japanese and English subtitles | sous-titres japonais et anglais | japanische und englische Untertitel | 日英双语字幕 |

## 参考

- 前回イベントの多言語データ `saiff2026winter/i18n.js` に、スポンサー名などの既訳がある（例：`sponsor-aiddsapporo`）。
- 英語名 "Sapporo International AI Film Festival & Incubation" はブランド表記としてそのまま使う。

## 한국어（韓国語）の固定訳

| 日本語 | 한국어 |
|---|---|
| 札幌国際AI映画祭 | 삿포로 국제 AI 영화제（固有名として "Sapporo International AI Film Festival" を併記可） |
| 札幌国際AI映画祭実行委員会 | 삿포로 국제 AI 영화제 집행위원회 |
| 札幌すごいAI会／札幌すごいAIまつり | 삿포로 스고이 AI 카이（Sapporo Sugoi AI Kai）／삿포로 스고이 AI 마츠리 |
| 札幌文化芸術劇場 hitaru | 삿포로 문화예술극장 hitaru |
| 札幌文化芸術交流センター SCARTS | 삿포로 문화예술교류센터 SCARTS |
| 札幌市民交流プラザ | 삿포로 시민교류플라자 |
| SCARTS コート／スタジオA・B／モール | SCARTS 코트 / 스튜디오 A·B / 몰 |
| ホワイエ | 로비(포이어) |
| 理念／プログラム／チケット／作品応募／スポンサー募集／支援者／お知らせ | 이념 / 프로그램 / 티켓 / 작품 공모 / 스폰서 모집 / 후원자 / 공지 |
| 物語を浴びる。創造力を知る。未来を起動する。 | 이야기에 흠뻑 젖다. 창조력을 알다. 미래를 시동하다. |
| 物語を解き放て。魂を揺さぶれ。種火はもう、その手にある。 | 이야기를 풀어놓아라. 영혼을 흔들어라. 불씨는 이미 당신 손안에 있다. |
| 種火／種火ナンバー | 불씨 / 불씨 번호 |
| あなたは何を創る？ 見せてくれ。全部見届けるから。 | 당신은 무엇을 만들 것인가? 보여 달라. 끝까지 모두 지켜볼 테니. |
| 劇場上映・授賞式／セレクション上映／クリエイター講演・トーク／交流会 | 극장 상영·시상식 / 셀렉션 상영 / 크리에이터 강연·토크 / 교류회 |
| 二次選考通過／最終選考通過（ファイナリスト）／一次審査 | 2차 선정 / 최종 선정(파이널리스트) / 1차 심사 |
| グランプリ／審査員特別賞／企業賞／SAPPORO賞／優秀賞 | 그랑프리 / 심사위원 특별상 / 기업상 / SAPPORO상 / 우수상 |
| 審査員長／審査員・登壇者 | 심사위원장 / 심사위원·연사 |
| 実行委員／実行委員長／広報部長／AIクリエイティブ部長 | 집행위원 / 집행위원장 / 홍보부장 / AI 크리에이티브 부장 |
| 岸本悠佑／内藤紗由里／赤獅子屋 | 기시모토 유스케 / 나이토 사유리 / 아카지시야 |
| 株式会社EQUES 北海道支社長／株式会社desiign 代表取締役 | EQUES 주식회사 홋카이도 지사장 / desiign 주식회사 대표이사 |
| AI駆動開発勉強会 札幌支部 | AI 주도 개발 스터디 삿포로 지부 |
| プラチナ／ゴールド／シルバー／スポンサー | 플래티넘 / 골드 / 실버 / 스폰서 |
| クリエイター招聘スポンサー／クリエイター招聘基金 | 크리에이터 초청 스폰서 / 크리에이터 초청 기금 |
| スポンサーセッション／クロージングクレジット／ループ上映内CM／ホワイエのブース | 스폰서 세션 / 클로징 크레딧 / 루프 상영 내 광고 / 로비 부스 |
| ファウンディングサポーター／プレミアムサポーター | 파운딩 서포터 / 프리미엄 서포터 |
| クラウドファンディング／先行支援／先行販売／一般販売 | 크라우드펀딩 / 선행 후원 / 선행 판매 / 일반 판매 |
| 劇場入場（指定席）／オンラインアーカイブ／現地フル参加 | 극장 입장(지정석) / 온라인 아카이브 / 현장 풀 참가 |
| 応募料／応募締切／制作ガイドライン | 참가비 / 공모 마감 / 제작 가이드라인 |
| 法的表記／プライバシーポリシー | 법적 고지 / 개인정보 처리방침 |
| 準備中／12月受付開始予定／10月下旬開始予定 | 준비 중 / 12월 접수 시작 예정 / 10월 하순 시작 예정 |
| ＜仮＞／＜調整中＞／＜順次発表＞ | ＜미정＞ / ＜조정 중＞ / ＜순차 발표＞ |
| 2027年5月4日（火・祝）／1,000円 | 2027년 5월 4일(화·공휴일) / 1,000엔 |
| 文体 | 존댓말(합쇼체 기본, 안내문은 해요체 가능). 見出し・タグラインは簡潔に。 |
