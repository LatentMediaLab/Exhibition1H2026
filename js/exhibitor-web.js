// Floating "web" of exhibitor names on index.html, built from EXHIBITORS
// (js/exhibitors-data.js). Each name drifts on its own, gently repelling the
// others so labels don't overlap, and is linked by a redrawn-every-frame
// line to its nearest neighbors — a constellation rather than a fixed graph,
// so the web stays intact as names float apart and back together. artist-10
// (Scott Allen) is pinned near the container's center as the cluster's hub,
// with a spoke drawn to every other node in addition to its nearest ones.
// Any name can be picked up and dragged; releasing it eases it back to
// wherever it was floating from before it was grabbed.
//
// Renders as a plain wrapped list (see .exhibitor-web in css/style.css) and
// stays that way if EXHIBITORS isn't loaded, JS fails, or the visitor has
// prefers-reduced-motion set — the floating behavior is an enhancement, not
// a requirement for the names to be readable and clickable.

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("exhibitorWeb");
  if (!container || typeof EXHIBITORS === "undefined") return;

  // hiragana/katakana (U+3040-30FF) + CJK ideographs (U+3400-9FFF)
  const JP_RE = /[぀-ヿ㐀-鿿]/;
  const HUB_ID = "artist-10"; // Scott Allen

  const nodes = EXHIBITORS.map((artist) => {
    const li = document.createElement("li");
    li.className = "exhibitor-web__item";

    const link = document.createElement("a");
    link.className = "exhibitor-web__link";
    link.href = `artist.html?id=${artist.id}`;
    link.textContent = artist.name.trim();
    // links are natively draggable (browser drag-to-bookmark/drag-to-tab);
    // that gesture competes with our own pointer-drag below and can hijack
    // it mid-move, so it's switched off in favor of our custom handling
    link.draggable = false;
    if (JP_RE.test(artist.name)) link.lang = "ja";

    li.appendChild(link);
    container.appendChild(li);
    return {
      el: li,
      link,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 0,
      h: 0,
      placed: false,
      dragging: false,
      returning: false,
      returnX: 0,
      returnY: 0,
      isHub: artist.id === HUB_ID,
    };
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!nodes.length) return;

  const hubIndex = nodes.findIndex((n) => n.isHub);

  container.classList.add("exhibitor-web--live");

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("exhibitor-web__lines");
  svg.setAttribute("aria-hidden", "true");
  container.insertBefore(svg, container.firstChild);

  // Nearest-neighbor edges (plus one hub spoke per node) are recomputed
  // every frame, so lines (and their paired gradients) are reused
  // (repositioned/hidden) rather than created and destroyed each tick.
  // Sized for the worst case: every node gets a hub spoke and NEIGHBORS
  // nearest-edges, before dedup.
  const NEIGHBORS = 2;
  const defs = document.createElementNS(svgNS, "defs");
  svg.appendChild(defs);

  let gradientUid = 0;
  const lines = Array.from({ length: nodes.length * (NEIGHBORS + 1) }, () => {
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.id = `exhibitor-web-line-${gradientUid++}`;
    gradient.setAttribute("gradientUnits", "userSpaceOnUse");
    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    gradient.append(stop1, stop2);
    defs.appendChild(gradient);

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke", `url(#${gradient.id})`);
    svg.appendChild(line);
    return { line, gradient, stop1, stop2 };
  });

  // Each connection (by node-index pair, not by pooled <line> slot — a slot
  // can render a different pair from one frame to the next) keeps whichever
  // color pair it's first assigned, so the web doesn't flicker as it
  // reconfigures. The two colors are always distinct. All variants of red,
  // weighted so the pure red shows up most often and maroon is the rarest.
  const LINE_COLORS = [
    { color: "#ff0000", weight: 4 }, // red
    { color: "#ff6666", weight: 3 }, // light red
    { color: "#cc0000", weight: 2 }, // dark red
    { color: "#660000", weight: 1 }, // maroon
  ];
  function weightedPick(pool) {
    const total = pool.reduce((sum, c) => sum + c.weight, 0);
    let r = Math.random() * total;
    for (const c of pool) {
      if (r < c.weight) return c;
      r -= c.weight;
    }
    return pool[pool.length - 1];
  }

  const edgeColors = new Map();
  function colorPairForEdge(key) {
    let pair = edgeColors.get(key);
    if (!pair) {
      const first = weightedPick(LINE_COLORS);
      const second = weightedPick(LINE_COLORS.filter((c) => c !== first));
      pair = [first.color, second.color];
      edgeColors.set(key, pair);
    }
    return pair;
  }

  // #exhibitorWeb now spans the full .exhibitors section (a sibling of
  // .exhibitors__inner, not nested in it) so there's room to drag names out
  // wide — but they should still spawn looking like the old, narrower
  // layout. innerColumn gives the initial scatter that narrower width; the
  // drag/float bounds themselves stay the full container everywhere else.
  const innerColumn = document.querySelector("#exhibitors .exhibitors__inner");

  function measure() {
    const rect = container.getBoundingClientRect();
    const innerRect = innerColumn ? innerColumn.getBoundingClientRect() : rect;
    const spawnLeft = Math.max(innerRect.left - rect.left, 0);
    const spawnWidth = Math.min(innerRect.width, rect.width);

    nodes.forEach((n) => {
      n.w = n.el.offsetWidth;
      n.h = n.el.offsetHeight;
      const maxX = Math.max(rect.width - n.w, 0);
      const maxY = Math.max(rect.height - n.h, 0);
      if (!n.placed) {
        if (n.isHub) {
          // the hub starts dead center of the full section; everyone else
          // starts scattered within the narrower .exhibitors__inner column
          n.x = maxX / 2;
          n.y = maxY / 2;
        } else {
          const spawnMaxX = Math.max(spawnWidth - n.w, 0);
          n.x = Math.min(spawnLeft + Math.random() * spawnMaxX, maxX);
          n.y = Math.random() * maxY;
        }
        n.placed = true;
      } else if (!n.dragging) {
        n.x = Math.min(n.x, maxX);
        n.y = Math.min(n.y, maxY);
      }
    });
  }

  measure();
  window.addEventListener("resize", measure);

  const WANDER = 0.06; // random per-frame nudge, keeps the drift from ever fully settling
  const HUB_WANDER_SCALE = 0.3; // the hub jitters less — it's an anchor, not a drifter
  const HUB_STRENGTH = 0.015; // spring pulling the hub back toward center
  // Return spring is deliberately underdamped — it overshoots the target by
  // ~28%, swings back past it the other way, then settles in well under a
  // second: two clear bounces, not the slow, heavily-damped glide the
  // ambient wander uses. The overshoot is proportional, so a small nudge
  // bounces just as visibly (percentage-wise) as a drag across the whole box.
  const RETURN_STRENGTH = 0.22; // spring pulling a released name back to its pre-drag spot
  const RETURN_DAMPING = 0.72; // much leakier than ambient DAMPING — that's what lets it overshoot
  const RETURN_DIST = 1; // px — close enough to call the return finished
  const RETURN_SPEED = 0.05; // px/frame — and slow enough too
  const RETURN_MAX_SPEED = 150; // px/frame safety cap, well above what any on-screen drag needs
  const DAMPING = 0.96; // velocity decay so wander doesn't accumulate into chaos
  const MAX_SPEED = 0.6; // px/frame cap
  const REPEL_PADDING = 28; // extra gap kept between label edges
  const REPEL_STRENGTH = 0.4;
  const EDGE_MARGIN = 16;
  const EDGE_STRENGTH = 0.02;

  function applyForces() {
    const rect = container.getBoundingClientRect();

    nodes.forEach((n) => {
      if (n.dragging) return;

      if (n.returning) {
        const dx = n.returnX - n.x;
        const dy = n.returnY - n.y;
        if (
          Math.hypot(dx, dy) < RETURN_DIST &&
          Math.hypot(n.vx, n.vy) < RETURN_SPEED
        ) {
          n.returning = false;
        } else {
          n.vx += dx * RETURN_STRENGTH;
          n.vy += dy * RETURN_STRENGTH;
          return; // no wander/hub-centering while easing back home
        }
      }

      const wanderScale = n.isHub ? HUB_WANDER_SCALE : 1;
      n.vx += (Math.random() - 0.5) * WANDER * wanderScale;
      n.vy += (Math.random() - 0.5) * WANDER * wanderScale;

      if (n.isHub) {
        const cx = rect.width / 2 - n.w / 2;
        const cy = rect.height / 2 - n.h / 2;
        n.vx += (cx - n.x) * HUB_STRENGTH;
        n.vy += (cy - n.y) * HUB_STRENGTH;
      }
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x + b.w / 2 - (a.x + a.w / 2);
        const dy = b.y + b.h / 2 - (a.y + a.h / 2);
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDist = (a.w + b.w) / 2 + REPEL_PADDING;
        if (dist < minDist) {
          const force = ((minDist - dist) / minDist) * REPEL_STRENGTH;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!a.dragging) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (!b.dragging) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }
    }

    nodes.forEach((n) => {
      if (n.dragging) return;
      if (n.x < EDGE_MARGIN) n.vx += (EDGE_MARGIN - n.x) * EDGE_STRENGTH;
      const rightEdge = rect.width - EDGE_MARGIN - n.w;
      if (n.x > rightEdge) n.vx -= (n.x - rightEdge) * EDGE_STRENGTH;
      if (n.y < EDGE_MARGIN) n.vy += (EDGE_MARGIN - n.y) * EDGE_STRENGTH;
      const bottomEdge = rect.height - EDGE_MARGIN - n.h;
      if (n.y > bottomEdge) n.vy -= (n.y - bottomEdge) * EDGE_STRENGTH;
    });
  }

  function integrate() {
    nodes.forEach((n) => {
      if (n.dragging) return; // pointermove drives position directly while dragging
      const damping = n.returning ? RETURN_DAMPING : DAMPING;
      n.vx *= damping;
      n.vy *= damping;
      const cap = n.returning ? RETURN_MAX_SPEED : MAX_SPEED;
      const speed = Math.hypot(n.vx, n.vy);
      if (speed > cap) {
        n.vx = (n.vx / speed) * cap;
        n.vy = (n.vy / speed) * cap;
      }
      n.x += n.vx;
      n.y += n.vy;
      n.el.style.transform = `translate(${n.x}px, ${n.y}px)`;
    });
  }

  function drawLines() {
    const centers = nodes.map((n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 }));
    const edges = new Set();
    const addEdge = (i, j) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`);

    // the hub gets a permanent spoke to every other node, on top of the
    // organic nearest-neighbor mesh below (duplicates just dedupe via the Set)
    if (hubIndex !== -1) {
      centers.forEach((_, i) => {
        if (i !== hubIndex) addEdge(hubIndex, i);
      });
    }

    centers.forEach((c, i) => {
      centers
        .map((other, j) => ({
          j,
          d: i === j ? Infinity : Math.hypot(other.x - c.x, other.y - c.y),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, NEIGHBORS)
        .forEach(({ j }) => addEdge(i, j));
    });

    const edgeList = Array.from(edges);
    lines.forEach(({ line, gradient, stop1, stop2 }, idx) => {
      const key = edgeList[idx];
      if (!key) {
        line.setAttribute("stroke-opacity", "0");
        return;
      }
      const [i, j] = key.split("-").map(Number);
      const p1 = centers[i];
      const p2 = centers[j];
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);
      line.setAttribute("stroke-opacity", "0.55");

      // gradient runs along the same segment as the line itself, so it
      // tracks the line's current direction instead of a fixed orientation
      gradient.setAttribute("x1", p1.x);
      gradient.setAttribute("y1", p1.y);
      gradient.setAttribute("x2", p2.x);
      gradient.setAttribute("y2", p2.y);
      const [colorA, colorB] = colorPairForEdge(key);
      stop1.setAttribute("stop-color", colorA);
      stop2.setAttribute("stop-color", colorB);
    });
  }

  // Pointer-drag: picks a node up (excludes it from physics — see the
  // `dragging` checks above) and drops it back into the simulation on
  // release. A real click still navigates; a drag of more than a few
  // pixels suppresses the click that would otherwise follow the pointerup.
  function setupDrag(n) {
    const el = n.link;
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;
    let moved = false;

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      pointerId = e.pointerId;
      el.setPointerCapture(pointerId);
      const rect = container.getBoundingClientRect();
      offsetX = e.clientX - rect.left - n.x;
      offsetY = e.clientY - rect.top - n.y;
      moved = false;
      // wherever it's grabbed from is "home" for this drag — including
      // mid-flight through a previous drag's return
      n.returnX = n.x;
      n.returnY = n.y;
      n.returning = false;
      n.dragging = true;
      n.vx = 0;
      n.vy = 0;
      n.el.classList.add("is-dragging");
    });

    el.addEventListener("pointermove", (e) => {
      if (!n.dragging || e.pointerId !== pointerId) return;
      const rect = container.getBoundingClientRect();
      const maxX = Math.max(rect.width - n.w, 0);
      const maxY = Math.max(rect.height - n.h, 0);
      const nx = e.clientX - rect.left - offsetX;
      const ny = e.clientY - rect.top - offsetY;
      if (Math.abs(nx - n.x) > 2 || Math.abs(ny - n.y) > 2) moved = true;
      n.x = Math.min(Math.max(nx, 0), maxX);
      n.y = Math.min(Math.max(ny, 0), maxY);
      n.el.style.transform = `translate(${n.x}px, ${n.y}px)`;
    });

    function endDrag(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      el.releasePointerCapture(pointerId);
      pointerId = null;
      n.dragging = false;
      n.returning = true; // eases back to n.returnX/Y — see applyForces()
      n.el.classList.remove("is-dragging");
    }
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    el.addEventListener("click", (e) => {
      if (!moved) return;
      e.preventDefault();
      moved = false;
    });
  }

  nodes.forEach(setupDrag);

  let raf = null;
  function step() {
    applyForces();
    integrate();
    drawLines();
    raf = requestAnimationFrame(step);
  }

  // pause off-screen to save battery/CPU, same pattern script.js uses for videos
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(step);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
    },
    { threshold: 0.05 },
  );
  io.observe(container);
});
