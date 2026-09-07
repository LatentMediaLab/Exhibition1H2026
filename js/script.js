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

// ---------------------------------------------------------------------------
// The closing marquee.
//
// This used to be a pure CSS keyframe: every question twice in one long track,
// sliding by -50%. That made the animated element enormous — 42,000px wide at
// a 390px viewport, 73,000px at 1280 — and because the scaleX(0.5) squash
// halves paint but NOT layout, twice as wide as what actually gets drawn.
// Safari has to keep a composited layer that size for a transform animation,
// and past some threshold it simply stops backing it: the text vanished in
// clean rectangular blocks, sometimes leaving only a sliver at one edge.
// (Desktop Safari and iOS both; Chromium and headless WebKit never showed it,
// which is why it took a screenshot from a real browser to pin down.)
//
// So the track no longer holds the whole script. It holds just enough spans to
// cover the viewport, and the leftmost one is recycled to the end with the
// next question's text as it scrolls off — the same five questions cycle
// forever through a handful of elements. The layer stays a few thousand px
// wide at any viewport, whatever font-size the hero solves to.
//
// The full question list stays in .footer__marquee's aria-label (the track
// itself is aria-hidden), so recycling text through fewer spans doesn't change
// what a screen reader is offered.
const MARQUEE_CYCLE_SECONDS = 240; // one full pass of all five, as the keyframe had
const MARQUEE_MAX_SPANS = 24; // guard against a pathological font-size/viewport ratio
let marqueeRun = null;

// layout width, i.e. pre-squash: the track's own translateX is applied inside
// the scaled parent, so distances here are in that same unscaled space
function marqueeItemWidth(el) {
  return el.offsetWidth + parseFloat(getComputedStyle(el).marginRight || 0);
}

function startMarquee() {
  const track = document.querySelector(".footer__marquee-track");
  if (!track) return;

  if (marqueeRun) {
    cancelAnimationFrame(marqueeRun.raf);
    marqueeRun = null;
  }

  // read the script off the markup once — after the first run the DOM only
  // holds the recycled pool, which is a different (usually shorter) list
  if (!startMarquee.questions) {
    startMarquee.questions = Array.from(track.children).map((el) =>
      el.textContent.trim(),
    );
  }
  const questions = startMarquee.questions;
  if (!questions.length) return;

  const makeSpan = (text) => {
    const span = document.createElement("span");
    span.className = "footer__marquee-item";
    span.textContent = text;
    return span;
  };

  // one span per question first: their widths at the current font-size are
  // what set the pace, so that stays keyed to the whole script rather than to
  // however many spans the pool happens to need
  track.replaceChildren(...questions.map(makeSpan));
  syncMarqueeSize();

  const widths = Array.from(track.children).map(marqueeItemWidth);
  const cycleWidth = widths.reduce((a, b) => a + b, 0);
  const widest = Math.max(...widths);
  if (!cycleWidth) return;
  const speed = cycleWidth / MARQUEE_CYCLE_SECONDS; // layout px per second

  // enough to cover the viewport even in the instant after the leftmost span
  // is pulled off the front. innerWidth is doubled because a visible pixel
  // costs two layout pixels under the squash.
  const needed = window.innerWidth * 2 + widest;
  let total = cycleWidth;
  // the pool currently ends on the last question, so the cycle picks back up
  // at the first one
  let next = 0;
  while (total < needed && track.children.length < MARQUEE_MAX_SPANS) {
    const span = makeSpan(questions[next]);
    track.appendChild(span);
    // sized here rather than waiting for the syncMarqueeSize() below, because
    // the loop's own exit condition depends on measuring it at its real size
    span.style.fontSize = getComputedStyle(track.firstElementChild).fontSize;
    next = (next + 1) % questions.length;
    total += marqueeItemWidth(span);
  }
  // trim any span the viewport doesn't need (the common case: the five
  // questions are far wider than one screen, so this drops most of them)
  while (track.children.length > 2) {
    const last = track.lastElementChild;
    const trimmed = total - marqueeItemWidth(last);
    if (trimmed < needed) break;
    last.remove();
    total = trimmed;
    next = (next - 1 + questions.length) % questions.length;
  }
  syncMarqueeSize(); // size any span added above

  let offset = 0;
  let firstWidth = marqueeItemWidth(track.firstElementChild);
  let last = null;
  // a rebuild (resize) starts the pool over at 0, so clear whatever offset the
  // previous run left behind rather than waiting for the first frame — while
  // the footer is off-screen no frame runs, and the stale shift would show
  track.style.transform = "translateX(0px)";

  const state = { raf: 0 };
  function frame(now) {
    if (last !== null) {
      offset -= (speed * (now - last)) / 1000;
      // width is only re-read on recycle, not every frame — reading it per
      // frame would force a synchronous layout on each one
      while (-offset >= firstWidth && track.children.length > 1) {
        offset += firstWidth;
        const recycled = track.firstElementChild;
        recycled.textContent = questions[next];
        next = (next + 1) % questions.length;
        track.appendChild(recycled);
        firstWidth = marqueeItemWidth(track.firstElementChild);
      }
      track.style.transform = "translateX(" + offset + "px)";
    }
    last = now;
    state.raf = requestAnimationFrame(frame);
  }

  // runs for as long as the page is open, whether or not the footer is in
  // view: it's one continuous loop the visitor should be able to scroll back
  // to and find further along, not something that waits for an audience.
  // (Off-screen pausing was tried and reads as the marquee resetting.)
  // Backgrounding the tab still parks it — browsers stop rAF there on their
  // own — and it picks up from the same place on return, because each frame
  // advances by real elapsed time rather than by a fixed step.
  state.raf = requestAnimationFrame(frame);

  marqueeRun = state;
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
  // startMarquee() rebuilds the marquee's spans and calls syncMarqueeSize()
  // itself once they exist — it has to measure them at their final size to
  // work out how many the viewport needs
  const runFit = () => {
    fitSquashedTitles();
    startMarquee();
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

  // Width-gated, not every resize: on mobile browsers the URL bar sliding in
  // and out as you scroll fires resize with only the height changed, and
  // re-running the fit there rebuilt the marquee mid-loop — which read as it
  // snapping back to the start every time you scrolled. Everything runFit()
  // solves for (the squashed titles, the marquee's pool and pace) is keyed to
  // width alone, so a height-only change has nothing to recompute.
  let resizeTimer;
  let lastFitWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastFitWidth) return;
    lastFitWidth = window.innerWidth;
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
