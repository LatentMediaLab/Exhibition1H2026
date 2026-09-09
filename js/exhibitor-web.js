// Floating "web" of exhibitor names on index.html, built from EXHIBITORS
// (js/exhibitors-data.js). Each name drifts on its own, gently repelling the
// others so labels don't overlap, and is joined to the others by lines
// redrawn every frame as the names move — a star-constellation of threads
// between people, not a chart.
//
// Those threads are a fixed graph now (see RELATIONSHIPS below), not the
// nearest-neighbour mesh this used to draw. Lines that follow whoever happens
// to be closest look like a constellation but mean nothing; these are the
// actual relationships between the exhibitors, so which names are tied
// together stays true no matter where they drift to.
//
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
  const NO_WRAP_ID = "artist-04"; // 莉山 (A) — has a space too, but stays on one line

  const nodes = EXHIBITORS.map((artist) => {
    const li = document.createElement("li");
    li.className = "exhibitor-web__item";

    const link = document.createElement("a");
    link.className = "exhibitor-web__link";
    link.href = `artist.html?id=${artist.id}`;
    const trimmedName = artist.name.trim();
    // on mobile, names with a space break to two lines instead of shrinking
    // to fit — see .exhibitor-web__link--breakable in css/style.css. A <br>
    // forces the break regardless of white-space, unlike a plain space,
    // which the absolutely-positioned (shrink-to-fit) link never actually
    // wraps at — nothing narrows it enough to make that happen on its own.
    // Always inserted; css/style.css hides it (display: none) outside the
    // mobile media query so desktop stays one line and it responds live to
    // resizing rather than being fixed by whatever width the page loaded at.
    if (trimmedName.includes(" ") && artist.id !== NO_WRAP_ID) {
      const spaceAt = trimmedName.indexOf(" ");
      // the space stays on the first part (not discarded) so desktop, where
      // .exhibitor-web__break is display: none, still reads as one
      // normally-spaced line instead of the two halves running together
      const first = trimmedName.slice(0, spaceAt + 1);
      const rest = trimmedName.slice(spaceAt + 1);
      const br = document.createElement("br");
      br.className = "exhibitor-web__break";
      link.append(first, br, rest);
      link.classList.add("exhibitor-web__link--breakable");
    } else {
      link.textContent = trimmedName;
    }
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
    };
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!nodes.length) return;

  container.classList.add("exhibitor-web--live");

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("exhibitor-web__lines");
  svg.setAttribute("aria-hidden", "true");
  container.insertBefore(svg, container.firstChild);

  // ---- the threads ------------------------------------------------------
  //
  // Six of them. Five are things the exhibitors chose — a way of working they
  // turn out to share — and each gets its own colour. The sixth is the one
  // nobody chose: where they were born and where they have moved since. That
  // one is drawn dashed, dimmer, and underneath the rest, because it is real
  // but it isn't a decision.
  //
  // Deliberately unlabelled. A key would turn this into a diagram to be
  // decoded; left alone it reads as what it is, a set of ties between people,
  // and the ones that matter are legible anyway (two names the same colour
  // are working on the same problem).
  //
  // Colours are lifted from the source map's palette, which was picked
  // against white — these are the same hues carried onto black, where the
  // originals went muddy.
  const THREADS = {
    // 装置をひらく — cutting into the mechanism that makes the image
    apparatus: { color: "#9C94FF", opacity: 0.95, width: 1.25 },
    // 観客を回路に入れる — the work isn't finished until someone enters it
    circuit: { color: "#3BD79E", opacity: 0.95, width: 1.25 },
    // リアルタイム上演 — made once, in the room, never twice the same
    live: { color: "#FF7C42", opacity: 0.95, width: 1.25 },
    // カテゴリーを引き直す — redrawing where human / nature / machine divide
    category: { color: "#FF7AA6", opacity: 0.95, width: 1.25 },
    // 規則が生成する — feeding rules to something non-human, and answering it
    rules: { color: "#F2B03A", opacity: 0.95, width: 1.25 },
    // 選んでいない線 — birthplace, and the moves since. Kept dimmer and
    // thinner than the five above: it should sit under them, not compete.
    given: { color: "#8A8A85", opacity: 0.5, width: 1, dash: "3 7", fade: "0.2" },
  };

  // 19 edges. Every exhibitor is tied to between three and seven others, so
  // nobody floats unconnected and nothing has to be faked to keep the web
  // whole — which is what the nearest-neighbour search used to be for.
  const RELATIONSHIPS = [
    // 選んでいない線 first, so the chosen threads draw over it
    ["artist-02", "artist-09", "given"], // 長谷川 / TANDA — 草津市
    ["artist-01", "artist-05", "given"], // 田中 / Fukuyo — 京都府
    ["artist-03", "artist-08", "given"], // 富永 / soshi — 大阪府
    ["artist-04", "artist-10", "given"], // 莉山 / Scott — 国外から日本へ
    ["artist-07", "artist-10", "given"], // imechiumaya / Scott — 拠点を移して

    ["artist-10", "artist-02", "apparatus"],
    ["artist-10", "artist-01", "apparatus"],
    ["artist-01", "artist-02", "apparatus"],

    ["artist-04", "artist-05", "circuit"],
    ["artist-05", "artist-06", "circuit"],
    ["artist-06", "artist-04", "circuit"],

    ["artist-08", "artist-09", "live"],
    ["artist-09", "artist-10", "live"],
    ["artist-10", "artist-08", "live"],

    ["artist-03", "artist-07", "category"],
    ["artist-07", "artist-04", "category"],
    ["artist-04", "artist-03", "category"],

    ["artist-06", "artist-01", "rules"],
    ["artist-06", "artist-10", "rules"],
  ];

  const defs = document.createElementNS(svgNS, "defs");
  svg.appendChild(defs);

  const nodeIndexById = new Map(EXHIBITORS.map((artist, i) => [artist.id, i]));

  let gradientUid = 0;
  const lines = RELATIONSHIPS.map(([fromId, toId, threadName]) => {
    const i = nodeIndexById.get(fromId);
    const j = nodeIndexById.get(toId);
    const thread = THREADS[threadName];
    // an edge naming someone who isn't in EXHIBITORS simply isn't drawn,
    // rather than throwing and taking the whole web down with it
    if (i === undefined || j === undefined || !thread) return null;

    // Each line fades out towards both ends instead of stopping dead at the
    // name — that's what keeps it reading as a drawn thread rather than a
    // connector, and it stops ten labels' worth of lines converging into
    // solid knots where they meet.
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.id = `exhibitor-web-thread-${gradientUid++}`;
    gradient.setAttribute("gradientUnits", "userSpaceOnUse");
    [
      ["0%", "0.1"],
      ["50%", "1"],
      ["100%", "0.1"],
    ].forEach(([offset, alpha]) => {
      const stop = document.createElementNS(svgNS, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", thread.color);
      stop.setAttribute("stop-opacity", alpha);
      gradient.appendChild(stop);
    });
    defs.appendChild(gradient);

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("stroke", `url(#${gradient.id})`);
    line.setAttribute("stroke-width", thread.width);
    line.setAttribute("stroke-opacity", thread.opacity);
    if (thread.dash) line.setAttribute("stroke-dasharray", thread.dash);
    svg.appendChild(line);

    return { i, j, line, gradient };
  }).filter(Boolean);

  // ---- influence --------------------------------------------------------
  //
  // How many threads a name is tied by, normalised to 0–1. It runs 3 to 7
  // across the ten, and it's the only measure of standing the map itself
  // offers, so it's what the physics below reads: the more threads a name
  // carries, the more firmly it holds its place, and the further the loosely
  // tied ones are free to roam around it.
  //
  // The source map warns that Scott Allen is structurally a hub (seven of the
  // nineteen threads reach him) and that letting the picture fan out around
  // him would contradict the point — an endless mutual remaking, not a centre
  // with satellites. So influence is deliberately NOT wired to WHERE a name
  // sits: placement stays random, and influence only decides how firmly each
  // one holds whatever spot it landed on.
  const degrees = nodes.map(() => 0);
  lines.forEach(({ i, j }) => {
    degrees[i]++;
    degrees[j]++;
  });
  const minDegree = Math.min(...degrees);
  const degreeSpread = Math.max(...degrees) - minDegree || 1;
  nodes.forEach((n, i) => {
    n.influence = (degrees[i] - minDegree) / degreeSpread;
  });

  // #exhibitorWeb now spans the full .exhibitors section (a sibling of
  // .exhibitors__inner, not nested in it) so there's room to drag names out
  // wide — but they should still spawn looking like the old, narrower
  // layout. innerColumn gives the initial scatter that narrower width; the
  // drag/float bounds themselves stay the full container everywhere else.
  const innerColumn = document.querySelector("#exhibitors .exhibitors__inner");

  // Declared up here, not with the physics constants further down: the
  // initial layout below runs during measure(), which is called before that
  // block is reached — a const referenced from above its own declaration is
  // a ReferenceError, not a hoisted undefined.
  const MIN_GAP = 22; // px of clear space no two labels may close below
  const SEPARATION_PASSES = 2; // re-runs per frame, so a name shoved out of
  // one overlap doesn't get left sitting inside the next one

  // Where the names start.
  //
  // Not a random scatter: the arrangement is solved from the threads
  // themselves, so who ends up near whom means something. Names sharing a
  // thread are drawn together and everything pushes everything else away,
  // relaxed over a few hundred iterations — the standard way a graph is laid
  // out, run once up front rather than every frame. Sharing a way of working
  // puts two names close on the page; the five thread-triangles surface as
  // loose clusters, and the lines have far less distance to cross, so the web
  // reads instead of tangling.
  //
  // The starting scatter it relaxes FROM is deterministic (hashed off each
  // name's index, not Math.random), so the same ten names always settle into
  // the same arrangement. Reloading shouldn't reshuffle who is standing next
  // to whom when that adjacency is the content.
  function solveLayout(spawnLeft, spawnWidth, height) {
    const ITERATIONS = 320;
    const IDEAL = Math.min(spawnWidth, height) * 0.42; // rest length of a thread
    const SPRING = 0.012; // pull along a thread
    const PUSH = 0.9; // shove between any two names
    const hash = (i) => {
      const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      return v - Math.floor(v);
    };

    const pts = nodes.map((n, i) => ({
      x: spawnLeft + hash(i) * Math.max(spawnWidth - n.w, 1),
      y: hash(i + 97) * Math.max(height - n.h, 1),
      w: n.w,
      h: n.h,
    }));

    for (let it = 0; it < ITERATIONS; it++) {
      lines.forEach(({ i, j }) => {
        const a = pts[i];
        const b = pts[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const pull = (dist - IDEAL) * SPRING;
        const fx = (dx / dist) * pull;
        const fy = (dy / dist) * pull;
        a.x += fx;
        a.y += fy;
        b.x -= fx;
        b.y -= fy;
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          // measured between label boxes, not centres — see separate()
          const want = (a.w + b.w) / 2 + MIN_GAP;
          if (dist < want) {
            const force = ((want - dist) / dist) * PUSH;
            a.x -= dx * force * 0.5;
            a.y -= dy * force * 0.5;
            b.x += dx * force * 0.5;
            b.y += dy * force * 0.5;
          }
        }
      }

      pts.forEach((p) => {
        p.x = Math.min(Math.max(p.x, spawnLeft), spawnLeft + spawnWidth - p.w);
        p.y = Math.min(Math.max(p.y, 0), Math.max(height - p.h, 0));
      });
    }

    // The relaxation only cares about distances, so the shape it settles on
    // can sit anywhere — it kept landing against one side with the other half
    // of the section empty. Recentre the whole constellation on what it
    // actually occupies.
    const left = Math.min(...pts.map((p) => p.x));
    const right = Math.max(...pts.map((p) => p.x + p.w));
    const top = Math.min(...pts.map((p) => p.y));
    const bottom = Math.max(...pts.map((p) => p.y + p.h));
    const shiftX = spawnLeft + (spawnWidth - (right - left)) / 2 - left;
    const shiftY = (height - (bottom - top)) / 2 - top;
    pts.forEach((p) => {
      p.x += shiftX;
      p.y += shiftY;
    });

    return pts;
  }

  function measure() {
    const rect = container.getBoundingClientRect();
    const innerRect = innerColumn ? innerColumn.getBoundingClientRect() : rect;
    const spawnLeft = Math.max(innerRect.left - rect.left, 0);
    const spawnWidth = Math.min(innerRect.width, rect.width);

    nodes.forEach((n) => {
      n.w = n.el.offsetWidth;
      n.h = n.el.offsetHeight;
    });

    const unplaced = nodes.some((n) => !n.placed);
    const solved = unplaced
      ? solveLayout(spawnLeft, spawnWidth, rect.height)
      : null;

    nodes.forEach((n, i) => {
      const maxX = Math.max(rect.width - n.w, 0);
      const maxY = Math.max(rect.height - n.h, 0);
      if (!n.placed) {
        n.x = Math.min(Math.max(solved[i].x, 0), maxX);
        n.y = Math.min(Math.max(solved[i].y, 0), maxY);
        // where the graph put it is the spot gravity keeps it near
        n.homeX = n.x;
        n.homeY = n.y;
        n.placed = true;
      } else {
        n.homeX = Math.min(n.homeX, maxX);
        n.homeY = Math.min(n.homeY, maxY);
        if (!n.dragging) {
          n.x = Math.min(n.x, maxX);
          n.y = Math.min(n.y, maxY);
        }
      }
    });
  }

  measure();
  window.addEventListener("resize", measure);

  const WANDER = 0.13; // random per-frame nudge, keeps the drift from ever fully settling
  // How much of that nudge the most-connected name loses: at 0.85 it drifts on
  // 15% of the wander the least-connected gets. Not 1 — nothing should freeze.
  const WANDER_INFLUENCE = 0.85;
  const GRAVITY_MIN = 0.00024; // pull home for the loosest-tied name
  const GRAVITY_MAX = 0.0075; // ...and for the most tied. Still small numbers:
  // this is a slow settle over seconds, not a snap back into formation. The
  // gap between them is what carries the reading — a name tied by seven
  // threads sits almost still while one tied by three visibly roams, so the
  // web's structure is legible from the motion alone, without labelling it.
  const MASS_INFLUENCE = 2.5; // heaviest name is 3.5x as hard to shove as the lightest
  const massOf = (n) => 1 + MASS_INFLUENCE * n.influence;
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
          return; // no wander while easing back home
        }
      }

      // gravity back towards where it started, and a wander that fights it.
      // Both are scaled by influence, from opposite ends: a name carrying
      // seven threads is held firmly and barely drifts, one carrying three
      // is only loosely tethered and roams. The pull is small enough that
      // even the most anchored name is never quite still.
      const pull = GRAVITY_MIN + (GRAVITY_MAX - GRAVITY_MIN) * n.influence;
      n.vx += (n.homeX - n.x) * pull;
      n.vy += (n.homeY - n.y) * pull;

      const wander = WANDER * (1 - WANDER_INFLUENCE * n.influence);
      n.vx += (Math.random() - 0.5) * wander;
      n.vy += (Math.random() - 0.5) * wander;
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
          // influence is mass here too: when two names crowd each other, the
          // more heavily tied one gives less ground
          if (!a.dragging) {
            a.vx -= fx / massOf(a);
            a.vy -= fy / massOf(a);
          }
          if (!b.dragging) {
            b.vx += fx / massOf(b);
            b.vy += fy / massOf(b);
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

  // A hard floor on how close two names may sit, applied to positions after
  // the forces have had their say.
  //
  // The soft repulsion above can be argued with — and now that each name is
  // also being pulled home by gravity, it loses that argument whenever two
  // homes happen to land near each other, which is how labels ended up
  // touching. This doesn't negotiate: overlapping boxes are moved apart, and
  // their HOMES are moved with them, so gravity stops pulling them back into
  // each other and the arrangement relaxes into one that has room for
  // everybody instead of fighting itself forever.
  //
  // Boxes, not radii: these are text labels of very different widths, and a
  // circle big enough to clear "Kazuki Fukuyo" sideways would hold everything
  // absurdly far apart vertically.
  function separate() {
    const rect = container.getBoundingClientRect();

    for (let pass = 0; pass < SEPARATION_PASSES; pass++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x + b.w / 2 - (a.x + a.w / 2);
          const dy = b.y + b.h / 2 - (a.y + a.h / 2);
          const overlapX = (a.w + b.w) / 2 + MIN_GAP - Math.abs(dx);
          const overlapY = (a.h + b.h) / 2 + MIN_GAP - Math.abs(dy);
          if (overlapX <= 0 || overlapY <= 0) continue; // already clear

          // a dragged name is pinned to the pointer, so the other one yields
          // the whole distance; otherwise the heavier (better-connected) name
          // gives less ground, as it does under the soft repulsion
          const ma = massOf(a);
          const mb = massOf(b);
          let shareA = mb / (ma + mb);
          let shareB = 1 - shareA;
          if (a.dragging) {
            shareA = 0;
            shareB = 1;
          } else if (b.dragging) {
            shareA = 1;
            shareB = 0;
          }

          // push along whichever axis needs the least movement to clear
          if (overlapX < overlapY) {
            const dir = dx < 0 ? 1 : -1;
            nudge(a, dir * overlapX * shareA, 0, rect);
            nudge(b, -dir * overlapX * shareB, 0, rect);
          } else {
            const dir = dy < 0 ? 1 : -1;
            nudge(a, 0, dir * overlapY * shareA, rect);
            nudge(b, 0, -dir * overlapY * shareB, rect);
          }
        }
      }
    }
  }

  function nudge(n, dx, dy, rect) {
    if (n.dragging || (!dx && !dy)) return;
    const maxX = Math.max(rect.width - n.w, 0);
    const maxY = Math.max(rect.height - n.h, 0);
    n.x = Math.min(Math.max(n.x + dx, 0), maxX);
    n.y = Math.min(Math.max(n.y + dy, 0), maxY);
    // the home moves too — otherwise gravity spends forever hauling this name
    // back into the neighbour it was just separated from
    n.homeX = Math.min(Math.max(n.homeX + dx, 0), maxX);
    n.homeY = Math.min(Math.max(n.homeY + dy, 0), maxY);
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

  // Which names are joined never changes — only where they are. So this just
  // moves each thread's endpoints onto its two names, with no edge search
  // and no colour bookkeeping (both of which the old nearest-neighbour
  // version needed to stop the web flickering as it reconfigured).
  function drawLines() {
    const centers = nodes.map((n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 }));
    lines.forEach(({ i, j, line, gradient }) => {
      const p1 = centers[i];
      const p2 = centers[j];
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);

      // the gradient runs along the same segment as the line, so its fade
      // tracks the thread's current direction rather than a fixed one
      gradient.setAttribute("x1", p1.x);
      gradient.setAttribute("y1", p1.y);
      gradient.setAttribute("x2", p2.x);
      gradient.setAttribute("y2", p2.y);
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
    separate();
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
