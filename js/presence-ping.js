// Tells recursiveFitna that someone is reading this site.
//
// recursiveFitna (one of the works in the show) changes how it writes
// depending on whether anyone is paying attention to it. Its strongest
// signals come from the gallery itself — a face on the webcam, phones in
// the room — but this is the third and weakest one: a person reading the
// exhibition site from anywhere in the world, at any hour, still counts as
// being witnessed. It's what keeps the piece from behaving as though it's
// completely alone at 3am when someone on the other side of the planet is
// in fact reading about it.
//
// Privacy: this sends nothing. No identifier, no cookie, no analytics, no
// page path, no body at all — just an empty POST whose only information is
// that it happened. The server counts how many arrived in the last five
// minutes and immediately forgets the rest.
//
// This is entirely best-effort. If the endpoint is down, unreachable, or
// simply hasn't been set up yet, every failure here is swallowed: the
// exhibition site must never break, log noise, or block on a signal that is
// only ever a nice-to-have.

(function () {
  // The recursiveFitna server, reachable from outside the gallery LAN
  // through a Cloudflare tunnel. Must be HTTPS: this page is served over
  // HTTPS from GitHub Pages, and browsers block plain-http requests from it.
  var ENDPOINT = "https://fitna.03080.jp/api/visit";

  // While a tab stays open, keep saying so — otherwise a single reader
  // registers as one instantaneous blip and is forgotten, which reads as
  // absence for someone who is actually still there reading.
  var HEARTBEAT_MS = 60 * 1000;

  function ping() {
    // Only report while the tab is actually being looked at. A page left
    // open in a background tab overnight isn't a person paying attention,
    // and counting it as one would quietly hold the piece in its
    // "witnessed" state for hours after everyone had gone.
    if (document.visibilityState !== "visible") return;
    try {
      // sendBeacon survives the page being closed mid-request and, with no
      // body, counts as a simple cross-origin request — so it needs no CORS
      // preflight and can't be delayed by one.
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT)) return;
      fetch(ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true }).catch(
        function () {},
      );
    } catch (err) {
      // Nothing here is worth surfacing to a visitor reading about a show.
    }
  }

  ping();
  setInterval(ping, HEARTBEAT_MS);
  // Coming back to the tab should register immediately rather than waiting
  // out the remainder of the current heartbeat.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") ping();
  });
})();
