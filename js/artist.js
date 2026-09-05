// Renders a single exhibitor's profile on artist.html from the ?id= query param.

// Converts a youtu.be / youtube.com/watch link into its embeddable form.
// Returns null for anything else so callers can fall back to a static thumb.
function getYouTubeEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (
      parsed.hostname.endsWith("youtube.com") &&
      parsed.searchParams.has("v")
    ) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
  } catch (e) {
    // not a valid URL — fall through to null
  }
  return null;
}

// Link thumbnails and search-result snippets (og:title/og:description and
// the plain "description" meta in <head>) are static — there's one
// artist.html serving every ?id=, so the generic placeholder only becomes
// the real name/bio once this runs and knows which artist that is. OG tags
// key off "property", the plain description off "name" — try both.
function setMeta(key, content) {
  const el = document.querySelector(
    `meta[property="${key}"], meta[name="${key}"]`,
  );
  if (el) el.content = content;
}

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

  document.title = `${artist.name} — .HUMAN by Latent Media Lab.`;
  setMeta("og:title", `${artist.name} — .HUMAN by Latent Media Lab.`);
  // twitter:title/description take precedence over the og: fallback on
  // Twitter/X, so they need the same per-artist update or a shared link
  // there would show the generic title instead
  setMeta("twitter:title", `${artist.name} — .HUMAN by Latent Media Lab.`);
  if (artist.bio) {
    setMeta("og:description", artist.bio);
    setMeta("twitter:description", artist.bio);
    setMeta("description", artist.bio);
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
      const embedUrl = work.url && getYouTubeEmbedUrl(work.url);
      if (embedUrl) {
        const iframe = document.createElement("iframe");
        iframe.src = embedUrl;
        iframe.title = work.title;
        iframe.loading = "lazy";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        thumb.appendChild(iframe);
      } else if (work.image) {
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
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = labels[key];
    socialContainer.appendChild(link);
  });

  content.hidden = false;
});
