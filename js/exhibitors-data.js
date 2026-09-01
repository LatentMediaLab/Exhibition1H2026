// Shared exhibitor data — read by artist.html to render individual profile pages.
// Fill in real work titles, genres, bios, and social links as they're confirmed.
//
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
    bio: "作家ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/DSC2705-scaled.jpg",
    social: { instagram: "https://instagram.com/yu_ki.exe" },
  },
  {
    id: "artist-02",
    name: "長谷川 凛太",
    work: "無題",
    genre: "ミクストメディア",
    bio: "作家ステートメント準備中。",
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
    bio: "作家ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/DSC01482-%E5%AF%8C%E6%B0%B8%E7%9C%9F%E7%BF%94224T114-scaled.jpg",
    social: { web: "#", x: "#", instagram: "#" },
  },
  {
    id: "artist-04",
    name: "莉山 (A)",
    work: "人物X",
    genre: "インスタレーション",
    bio: "作家ステートメント準備中。",
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
    bio: "作家ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/04/IMG_2105-224t143_%E7%A6%8F%E4%B8%8E%E4%B8%80%E5%96%9C.jpeg",
    social: { web: "#", x: "#", instagram: "#" },
  },
  {
    id: "artist-06",
    name: "Rui",
    work: "無題",
    genre: "ミクストメディア",
    bio: "作家ステートメント準備中。",
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
    bio: "作家ステートメント準備中。",
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
    bio: "作家ステートメント準備中。",
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
    bio: "作家ステートメント準備中。",
    photo:
      "https://media.kyoto-seika.ac.jp/latentmedia/wp-content/uploads/2026/03/224T195%E5%85%AD%E5%8F%8D%E7%94%B0-%E9%99%BD%E5%B0%9A-e1773920140825.jpg",
    pastWorks: [
      { title: "無題 I", year: "2025", medium: "映像インスタレーション" },
      { title: "無題 II", year: "2024", medium: "ジェネラティブ・イメージ" },
    ],
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
    bio: "作家ステートメント準備中。",
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
