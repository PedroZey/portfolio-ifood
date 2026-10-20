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

  // 4. Diagramas: traça as setas ao entrar na tela (uma vez)
  var figs = Array.prototype.slice.call(document.querySelectorAll(".fig"));
  if (figs.length && "IntersectionObserver" in window && !reduced) {
    var fObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var fig = e.target;
        fig.classList.add("draw");
        fObs.unobserve(fig);
      });
    }, { threshold: 0.3 });
    figs.forEach(function (fig) { fObs.observe(fig); });
  }
})();
