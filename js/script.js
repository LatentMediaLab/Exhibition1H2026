// .HUMAN — exhibition site interactions

// Sizes a squashed (scaleX 0.5) Dela Gothic One headline so its visible glyphs
// span exactly the element's own content-box width, edge to edge. transform
// scales paint only, not layout, so a CSS font-size formula can't account for
// it — this measures the text's true natural (pre-squash) width at a known
// reference size and solves for the font-size that makes the squashed result
// fit. Targets .hero__title, which holds an inner aria-hidden span with the
// literal text.
function fitSquashedTitles() {
  const squashFactor = 0.5;
  const refSize = 100; // px, arbitrary stable reference for measuring the ratio

  document.querySelectorAll(".hero__title").forEach((el) => {
    const span = el.querySelector("span");
    if (!span) return;

    const cs = getComputedStyle(el);
    const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const containerWidth = el.clientWidth - paddingX;
    if (containerWidth <= 0) return;

    el.style.fontSize = refSize + "px";
    const naturalWidthAtRef = span.scrollWidth; // layout width, unaffected by el's own transform
    if (naturalWidthAtRef <= 0) return;

    const naturalWidthPerPx = naturalWidthAtRef / refSize;
    const desiredNaturalWidth = containerWidth / squashFactor;
    el.style.fontSize = desiredNaturalWidth / naturalWidthPerPx + "px";
  });
}

// Keeps the closing marquee's question text at half the hero title's
// visual size, reading the size fitSquashedTitles() just solved for it.
function syncMarqueeSize() {
  const heroTitle = document.querySelector(".hero__title");
  if (!heroTitle) return;
  const heroFontSize = parseFloat(getComputedStyle(heroTitle).fontSize);
  document.querySelectorAll(".footer__marquee-item").forEach((el) => {
    el.style.fontSize = heroFontSize / 2 + "px";
  });
}

// Scrolls to the hash the page was opened with (stashed by the inline script
// in <head>, which strips it so the browser can't jump early). Called only
// once layout has settled — fonts loaded and the hero title resized — so the
// target is at its final position and doesn't drift out from under the user.
function scrollToInitialHash() {
  const hash = window.__initialHash;
  if (!hash) return;
  window.__initialHash = null;

  const target = document.querySelector(hash);
  if (!target) return;

  history.replaceState(null, "", hash);
  // "instant", not "auto" — auto defers to the page's scroll-behavior:smooth,
  // which animates from the top and reads as the very jump we're fixing
  target.scrollIntoView({ behavior: "instant", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  const runFit = () => {
    fitSquashedTitles();
    syncMarqueeSize();
  };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      runFit();
      // one frame later, so the resized hero has been laid out
      requestAnimationFrame(scrollToInitialHash);
    });
  } else {
    runFit();
    requestAnimationFrame(scrollToInitialHash);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(runFit, 100);
  });

  // reveal-on-scroll for content sections
  const revealTargets = document.querySelectorAll(
    ".about__inner, .guest__inner, .exhibitors__inner, .footer__inner"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => io.observe(el));

  // pause off-screen videos to save resources, resume when visible
  const videos = document.querySelectorAll("video");
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  videos.forEach((v) => videoIO.observe(v));
});
