// Renders a single exhibitor's profile on artist.html from the ?id= query param.

document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(window.location.search).get("id");
  const artist = window.EXHIBITORS
    ? EXHIBITORS.find((a) => a.id === id)
    : null;

  const content = document.getElementById("artistContent");
  const notFound = document.getElementById("artistNotFound");

  if (!artist) {
    notFound.hidden = false;
    document.title = "出展者が見つかりませんでした — .HUMAN";
    return;
  }

  document.getElementById("artistName").textContent = artist.name;
  document.getElementById("artistWork").textContent =
    `${artist.work} — ${artist.genre}`;
  document.getElementById("artistBio").textContent = artist.bio;

  const socialContainer = document.getElementById("artistSocial");
  const labels = { web: "Web", x: "X", instagram: "Instagram" };
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
