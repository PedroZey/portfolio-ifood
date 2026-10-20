(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Seção ativa no nav
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var a = byId[e.target.id];
        if (a) a.classList.add("active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObs.observe(el);
    });
  }

  // 2. Barra de progresso de leitura
  var bar = document.getElementById("progress");
  if (bar) {
    var tick = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    document.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // 3. Contadores do hero (só números com data-count)
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduced || isNaN(target)) { el.textContent = target; return; }
    var t0 = null, dur = 1100;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        cObs.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  // 4. Diagramas: linha sólida + pacote viajando + ponta que recebe.
  // Troca o marker compartilhado por pontas explícitas para sincronizar
  // o flash de cada ponta com a chegada do seu pacote.
  var figs = Array.prototype.slice.call(document.querySelectorAll(".fig"));
  function enhance(fig) {
    if (fig.dataset.enhanced) return;
    fig.dataset.enhanced = "1";
    var NS = "http://www.w3.org/2000/svg";
    var lines = fig.querySelectorAll(".ln:not(.dash)");
    Array.prototype.forEach.call(lines, function (ln, i) {
      var x1 = parseFloat(ln.getAttribute("x1"));
      var y1 = parseFloat(ln.getAttribute("y1"));
      var x2 = parseFloat(ln.getAttribute("x2"));
      var y2 = parseFloat(ln.getAttribute("y2"));
      ln.removeAttribute("marker-end");
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= len; dy /= len;
      var nx = -dy, ny = dx;
      var bx = x2 - dx * 8, by = y2 - dy * 8;
      var head = document.createElementNS(NS, "path");
      head.setAttribute("d", "M" + x2 + "," + y2 +
        "L" + (bx + nx * 4.2) + "," + (by + ny * 4.2) +
        "L" + (bx - nx * 4.2) + "," + (by - ny * 4.2) + "Z");
      head.setAttribute("class", "flow-head");
      head.setAttribute("stroke", "#161513");
      head.setAttribute("stroke-width", "1.5");
      head.setAttribute("stroke-linejoin", "round");
      head.style.animationDelay = (i * 0.22) + "s";
      ln.parentNode.insertBefore(head, ln.nextSibling);
      var dot = document.createElementNS(NS, "circle");
      dot.setAttribute("r", "3.2");
      dot.setAttribute("fill", "#161513");
      dot.setAttribute("class", "packet");
      dot.style.offsetPath = 'path("M' + x1 + " " + y1 + " L" + x2 + " " + y2 + '")';
      dot.style.animationDelay = (i * 0.22) + "s";
      ln.parentNode.insertBefore(dot, head.nextSibling);
    });
  }
  figs.forEach(enhance);
  if (figs.length && "IntersectionObserver" in window && !reduced) {
    var fObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("draw");
        fObs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    figs.forEach(function (fig) { fObs.observe(fig); });
  }
})();
