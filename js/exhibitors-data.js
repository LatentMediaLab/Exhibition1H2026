// Shared exhibitor data — read by artist.html to render individual profile pages.
// Fill in real work titles, genres, bios, and social links as they're confirmed.
//
// bio: about the exhibitor themselves — renders under their name, next to
//   their photo. For a paragraph break use a real "\n" — these render via
//   textContent, so HTML tags would show up as literal text on the page.
// statement: about the piece they're showing (`work`) — renders in its own
//   出展作品 section further down, NOT beside the bio. Optional: exhibitors
//   without one just show the work's title and medium there.
// photo: profile pictures hotlinked from the lab site's own media library
//   (https://media.kyoto-seika.ac.jp/latentmedia/people/). Paths with Japanese
//   filenames are percent-encoded so they resolve as URLs.
// pastWorks: PLACEHOLDER entries — swap in real titles/years/media (and add an
//   `image` per entry) once past work is collected from each exhibitor.

var EXHIBITORS = [
  {
    id: "artist-01",
    name: "田中 優貴",
    work: "無題",
    genre: "ミクストメディア",
    bio: "2005年生まれ。京都府出身。AIやプログラミングに関心を持ち、現在はビジュアル・グラフィック制作や、AIを用いたインタラクティブ表現など幅広く制作に取り組んでいる。特定の世界観に固執するよりも、まずは技術を本質から理解し応用できる柔軟な力を身につけることを重視している。日常をテクノロジーによって楽に、楽しくすることをテーマに分野にとらわれず幅広い技術を吸収し、表現力を高めていきたいと考えている。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/DSC2705-scaled.jpg",
    social: { instagram: "https://instagram.com/yu_ki.exe" },
  },
  {
    id: "artist-02",
    name: "長谷川 凛太",
    work: "無題",
    genre: "ミクストメディア",
    bio: "2005年生まれ。滋賀県草津市出身。映像表現に大きな興味を持ち、大学では、メッセージとギミックの融合、既存の映像表現から離れたアプローチを研究している。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/DSC26672.jpg",
    pastWorks: [
      {
        title: "Resistance レジスタンス",
        year: "2025",
        medium: "インスタレーション",
        url: "https://youtu.be/LZCLtD1d8W8",
      },
    ],
    social: {
      youtube:
        "https://www.youtube.com/playlist?list=PLDB8HCkUv0tirmnpNrkhbf081XXOTnKmx",
    },
  },
  {
    id: "artist-03",
    name: "富永 真翔",
    work: "無題",
    genre: "ミクストメディア",
    bio: "2003年大阪府生まれ。ゼミでは、自然というものを問い直し、さまざまな視点、解釈から自然を表現したい。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/DSC01482-%E5%AF%8C%E6%B0%B8%E7%9C%9F%E7%BF%94224T114-scaled.jpg",
  },
  {
    id: "artist-04",
    name: "莉山 (A)",
    work: "欠片.human",
    genre: "インスタレーション",
    bio:
      "2001年マレーシア生まれ。幼少期をイギリスで過ごし、複数の言語・文化環境の中で育つ。鑑賞者の身体的・社会的な参加によって成立する表現を探究し、インスタレーションを中心に制作している。鑑賞者同士の対話や相互作用、誤解やすれ違いといったコミュニケーションの不確かさに関心を持ち、人の行動や関係性そのものを素材として扱う。\n" +
      "\nこれまでに「『未来のえいでん』アートプロジェクト」（2025年）、「冷水機での対話 @左京区」（2026年）などのグループ展に参加。2025年「ASEAN-China Design Convergence」入選。2026年3月、「『未来のえいでん』アートプロジェクト」の参加者として2025年度京都精華大学学長表彰・学長特別賞を受賞。似鳥国際奨学財団奨学生。",
    statement:
      "送信できるのは、一つのメッセージだ。だが返ってくるのは九つの声だ。それぞれは、実際にあった関係を機械が分析し、そこから立ち上がった人格である。分析の途中で、長らく忘れていた記憶にふと触れることもあった。でも、誰の記憶が正解だったのか。自分なのか、機械なのか。欠片のような人格の姿も、自分の分かれた記憶の表現である。ここでは一人の人間が、重なり合う複数の時間軸の中に分裂している。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/AZHAN2026-04.jpg",
    pastWorks: [
      {
        title: "Tuhan 神",
        year: "2026",
        medium: "インスタレーション",
        url: "https://youtu.be/xEqdHaLwNmA",
      },
      {
        title: "離れていく",
        year: "2026",
        medium: "インスタレーション",
        url: "https://youtu.be/pVvXyHu8RCY",
      },
    ],
    social: {
      web: "https://03080.jp",
      x: "https://x.com/matsurinoyama",
      instagram: "https://www.instagram.com/03080.jp",
    },
  },
  {
    id: "artist-05",
    name: "Kazuki Fukuyo",
    work: "無題",
    genre: "ミクストメディア",
    bio: "京都府出身。ゼミでは鑑賞者と作品の相互性に基づくインタラクティブな表現を研究していきたい。現在は映像制作にも取り組んでいる。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/04/IMG_2105-224t143_%E7%A6%8F%E4%B8%8E%E4%B8%80%E5%96%9C.jpeg",
  },
  {
    id: "artist-06",
    name: "Rui",
    work: "無題",
    genre: "ミクストメディア",
    bio: "関西生まれ関西育ち。物語への没入体験をデザインすることを軸に、さまざまなジャンルで創作を続ける。主に展示という媒体を用いて新しい体験メディアの創造に挑戦したい。現在TRPGシナリオライター / イラストレーターとして活動中。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/IMG_8341-224T159%E6%9D%BE%E6%B0%B8%E3%81%BE%E3%81%AA%E3%81%BF.jpeg",
    social: {
      x: "https://x.com/Tokage_Thunder",
    },
  },
  {
    id: "artist-07",
    name: "imechiumaya",
    work: "無題",
    genre: "ミクストメディア",
    bio: "福井県出身、京都を拠点に活動。人間に着目し、問いを拾い上げ、自分なりの方法を通じて変換し表現する。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/imechiumaya_artistpicture.png",
    social: {
      youtube: "https://youtube.com/@imechiumaya",
      instagram: "https://instagram.com/imechiumaya",
    },
  },
  {
    id: "artist-08",
    name: "soshi yoshida",
    work: "無題",
    genre: "ミクストメディア",
    bio: "2005年大阪府生まれ。3DCGを軸にアートワークの制作やVJなどを行っている。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/soshi_Face_white-224T186%E5%90%89%E7%94%B0%E5%A3%AE%E5%BF%97.png",
    social: {
      web: "https://soshigod.github.io/portfolio",
      instagram: "https://instagram.com/soshigod_",
    },
  },
  {
    id: "artist-09",
    name: "TANDA",
    work: "無題",
    genre: "ミクストメディア",
    bio: "2006年生まれ。滋賀県草津市生まれ。映像制作やグラフィック制作している。また、音楽イベントのVJ に興味を持ち、サークルで照明、セットなどのライブ演出をしている。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/224T195%E5%85%AD%E5%8F%8D%E7%94%B0-%E9%99%BD%E5%B0%9A-e1773920140825.jpg",
    social: {
      tiktok: "https://www.tiktok.com/@panier597",
      instagram: "https://instagram.com/tan._.da",
    },
  },
  {
    id: "artist-10",
    name: "Scott Allen",
    work: "無題",
    genre: "ミクストメディア",
    bio:
      "2016年情報科学芸術大学院大学（IAMAS）修了。人の想像力と視覚装置やテクノロジーの関係に着目し、投影装置の仕組みに物理的に介入し変調したり、日用品に手を加えることで像を作るスタイルでインスタレーション制作・パフォーマンス活動を行なう。また、深層学習を用いた作品制作やAIと協奏するライブコーディングユニットAi.stepとしてもライブ活動を行なう。\n" +
      "\n主な受賞に、CVPR 2024 AI ART GALLERY Best works award、デジタル・ショック賞2019受賞、やまなしメディア芸術アワード2021優秀賞受賞など。近年参加の国際フェスティバルに「FILE 2025」(Foyer | Fiesp Cultural Center, Sao Paulo, Brazil)、「Scopitone 2019」(Île de Nantes, France)、「MUTEK Montréal Édition 21」(ONLINE Platform, Canada)などがある。",
    statement: "作品ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2024/10/ScottAllen_1400x933.jpg",
    pastWorks: [
      { title: "無題 I", year: "2025", medium: "映像インスタレーション" },
      { title: "無題 II", year: "2024", medium: "ジェネラティブ・イメージ" },
    ],
    social: {
      web: "https://scottallen.ws",
      x: "https://x.com/Scott_Allen__",
      instagram: "https://instagram.com/scott_allen___",
    },
  },
];
