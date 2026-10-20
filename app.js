// Destaque da seção atual no nav. Sem animação, sem dependência.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  if (!links.length || !("IntersectionObserver" in window)) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove("active"); });
      var a = byId[e.target.id];
      if (a) a.classList.add("active");
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  Object.keys(byId).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) obs.observe(el);
  });
})();
