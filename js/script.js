// .HUMAN — exhibition site interactions

// Matches css/style.css's @media (max-width: 720px) mobile breakpoint.
const MOBILE_BREAKPOINT = 720;

// Sizes a squashed (scaleX 0.5) Dela Gothic One headline so its visible glyphs
// span exactly the element's own content-box width, edge to edge. transform
// scales paint only, not layout, so a CSS font-size formula can't account for
// it — this measures the text's true natural (pre-squash) width at a known
// reference size and solves for the font-size that makes the squashed result
// fit. Targets .hero__title (always) and .hero__venue (mobile only — on
// desktop its fixed-content-width clamp() is the intended look), which each
// hold an inner aria-hidden span with the literal text.
function fitSquashedTitles() {
  const squashFactor = 0.5;
  const refSize = 100; // px, arbitrary stable reference for measuring the ratio

  function fit(el) {
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
  }

  document.querySelectorAll(".hero__title").forEach(fit);

  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  document.querySelectorAll(".hero__venue").forEach((el) => {
    if (isMobile) {
      fit(el);
    } else {
      el.style.fontSize = ""; // desktop: let the CSS clamp() take back over
    }
  });
}

// Keeps the closing marquee's question text sized off the hero title's
// visual size, reading the size fitSquashedTitles() just solved for it.
// artist.html has no real .hero__title to read from, so it builds an
// offscreen probe that reuses the exact same markup/CSS/fit logic — the
// marquee then solves to the same size index.html's would at this viewport.
// Desktop halves it for hierarchy under the hero title; mobile matches it
// 1:1 — the hero title itself is already much smaller there, so halving it
// again read as too small.
function syncMarqueeSize() {
  let heroTitle = document.querySelector(".hero__title");
  let probe = null;

  if (!heroTitle) {
    probe = document.createElement("h1");
    probe.className = "hero__title";
    probe.style.cssText =
      "position:absolute;visibility:hidden;width:100vw;left:0;top:0;";
    const span = document.createElement("span");
    span.textContent = ".HUMAN";
    probe.appendChild(span);
    document.body.appendChild(probe);
    fitSquashedTitles();
    heroTitle = probe;
  }

  const heroFontSize = parseFloat(getComputedStyle(heroTitle).fontSize);
  const scale = window.innerWidth <= MOBILE_BREAKPOINT ? 1 : 0.5;
  document.querySelectorAll(".footer__marquee-item").forEach((el) => {
    el.style.fontSize = heroFontSize * scale + "px";
  });

  if (probe) probe.remove();
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
  // covers the page until fonts are loaded and the squashed titles have
  // resized against them, so visitors don't see that settling happen
  const loadingScreen = document.getElementById("loadingScreen");
  let loadingHidden = false;
  function hideLoadingScreen() {
    if (loadingHidden || !loadingScreen) return;
    loadingHidden = true;
    loadingScreen.classList.add("loading-screen--hidden");
    loadingScreen.addEventListener(
      "transitionend",
      () => loadingScreen.remove(),
      { once: true },
    );
  }
  const runFit = () => {
    fitSquashedTitles();
    syncMarqueeSize();
  };

  // document.fonts.ready alone is not enough to gate on: it resolves whenever
  // font loading is momentarily idle, which on a cold load happens before the
  // stylesheet has even requested these faces. Naming them makes the wait real
  // — fitSquashedTitles() measures against the display face, so starting it
  // early solves for fallback metrics and the title visibly jumps later.
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('400 100px "Dela Gothic One"'),
      document.fonts.load('400 1rem "M PLUS 1 Code"'),
    ])
      .then(() => document.fonts.ready)
      .catch(() => {}); // a font that fails to load shouldn't strand the cover
  }

  // the hero video is the first thing on the page, so lifting the cover before
  // it can play reveals an empty black box. HAVE_FUTURE_DATA means enough is
  // buffered to start; error/missing source resolves too, so a video that will
  // never load can't hold the page back on its own.
  function videoReady() {
    const video = document.querySelector(".hero__video");
    if (!video) return Promise.resolve();
    if (video.readyState >= 3) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        video.removeEventListener("canplay", done);
        video.removeEventListener("playing", done);
        video.removeEventListener("error", done);
        resolve();
      };
      video.addEventListener("canplay", done);
      video.addEventListener("playing", done);
      video.addEventListener("error", done);
    });
  }

  // fit first, then reveal a frame later so the resized hero has been laid out
  // before the cover comes off and before we scroll to any hash target
  function finishLoad() {
    runFit();
    requestAnimationFrame(() => {
      scrollToInitialHash();
      hideLoadingScreen();
    });
  }

  // settles either way, so one slow asset can't strand the cover on its own
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((resolve) => setTimeout(resolve, ms)),
    ]);
  }

  // fonts are waited on outright — solving the fit against fallback metrics is
  // what makes the title visibly jump. The video only gets a budget: it's the
  // single largest asset on the page, and holding a black cover over a fully
  // laid-out page while it buffers is worse than letting it arrive a moment late.
  Promise.all([fontsReady(), withTimeout(videoReady(), 2500)]).then(finishLoad);

  // last resort for a stalled fetch. Runs the same fit rather than just
  // hiding, so the reveal is as correct as it can be with whatever has
  // arrived — and if the fonts land afterwards the line above re-fits and
  // corrects the size (hiding itself is idempotent).
  setTimeout(() => {
    if (!loadingHidden) finishLoad();
  }, 10000);

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
