// Renders a single exhibitor's profile on artist.html from the ?id= query param.

document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(window.location.search).get("id");
  const artist = window.EXHIBITORS ? EXHIBITORS.find((a) => a.id === id) : null;

  const content = document.getElementById("artistContent");
  const notFound = document.getElementById("artistNotFound");

  if (!artist) {
    notFound.hidden = false;
    document.title = "出展者が見つかりませんでした — .HUMAN";
    return;
  }

  document.getElementById("artistName").textContent = artist.name;
  document.getElementById("artistWork").textContent =
    `出展する作品：${artist.work} — ${artist.genre}`;
  document.getElementById("artistBio").textContent = artist.bio;

  // profile picture — the container stays empty (and collapsed by CSS) when
  // an exhibitor has no photo yet
  const photoContainer = document.getElementById("artistPhoto");
  if (artist.photo) {
    const img = document.createElement("img");
    img.src = artist.photo;
    img.alt = `${artist.name} のプロフィール写真`;
    img.loading = "lazy";
    photoContainer.appendChild(img);
  } else {
    photoContainer.hidden = true;
  }

  // 過去作品 — placeholder thumbnails until real images are supplied
  const pastWorksList = document.getElementById("artistPastWorks");
  const pastWorks = artist.pastWorks || [];
  if (pastWorks.length) {
    pastWorks.forEach((work) => {
      const item = document.createElement("li");
      item.className = "past-works__item";

      const thumb = document.createElement("div");
      thumb.className = "past-works__thumb";
      if (work.image) {
        const img = document.createElement("img");
        img.src = work.image;
        img.alt = work.title;
        img.loading = "lazy";
        thumb.appendChild(img);
      }

      const caption = document.createElement("p");
      caption.className = "past-works__caption";
      caption.lang = "ja";
      caption.textContent = `${work.title}（${work.year}年）— ${work.medium}`;

      item.append(thumb, caption);
      pastWorksList.appendChild(item);
    });
  } else {
    pastWorksList.closest(".past-works").hidden = true;
  }

  const socialContainer = document.getElementById("artistSocial");
  const labels = {
    web: "WEB",
    x: "X",
    instagram: "INSTAGRAM",
    youtube: "YOUTUBE",
    tiktok: "TIKTOK",
  };
  Object.keys(labels).forEach((key) => {
    const url = artist.social && artist.social[key];
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.className = "social-links__item";
    link.textContent = labels[key];
    socialContainer.appendChild(link);
  });

  content.hidden = false;
  document.title = `${artist.name} — .HUMAN`;
});
