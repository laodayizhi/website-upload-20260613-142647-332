document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 320) {
        backTop.classList.add("show");
      } else {
        backTop.classList.remove("show");
      }
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  var grid = document.querySelector("[data-search-grid]");
  if (grid) {
    var queryInput = document.querySelector("[data-search-input]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var empty = document.querySelector("[data-empty-result]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && queryInput) {
      queryInput.value = initial;
    }

    function text(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters() {
      var q = text(queryInput && queryInput.value);
      var cat = text(categoryFilter && categoryFilter.value);
      var year = text(yearFilter && yearFilter.value);
      var type = text(typeFilter && typeFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (cat && text(card.getAttribute("data-category")) !== cat) ok = false;
        if (year && text(card.getAttribute("data-year")) !== year) ok = false;
        if (type && text(card.getAttribute("data-type")) !== type) ok = false;
        card.hidden = !ok;
        if (ok) visible += 1;
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [queryInput, categoryFilter, yearFilter, typeFilter].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilters);
        el.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
});
