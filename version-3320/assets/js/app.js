(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var input = qs('[data-search-input]');
    var year = qs('[data-filter-year]');
    var region = qs('[data-filter-region]');
    var type = qs('[data-filter-type]');
    var items = qsa('.movie-filter-item');
    if (!items.length || (!input && !year && !region && !type)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    function apply() {
      var term = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      items.forEach(function (item) {
        var haystack = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.year,
          item.dataset.tags,
          item.textContent
        ].join(' '));
        var matched = true;
        if (term && haystack.indexOf(term) === -1) {
          matched = false;
        }
        if (selectedYear && normalize(item.dataset.year) !== selectedYear) {
          matched = false;
        }
        if (selectedRegion && normalize(item.dataset.region) !== selectedRegion) {
          matched = false;
        }
        if (selectedType && normalize(item.dataset.type) !== selectedType) {
          matched = false;
        }
        item.classList.toggle('is-filter-hidden', !matched);
      });
    }
    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
