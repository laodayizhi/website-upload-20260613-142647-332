(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot') || 0);
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var localFilter = document.querySelector('[data-local-filter]');
    if (localFilter) {
      localFilter.addEventListener('input', function () {
        var value = localFilter.value.trim().toLowerCase();
        document.querySelectorAll('[data-movie-card]').forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
        });
      });
    }

    var panel = document.querySelector('[data-search-panel]');
    if (panel) {
      var input = panel.querySelector('[data-search-input]');
      var region = panel.querySelector('[data-region-filter]');
      var type = panel.querySelector('[data-type-filter]');
      var sort = panel.querySelector('[data-sort-filter]');
      var container = document.querySelector('[data-card-container]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      var params = new URLSearchParams(window.location.search);

      if (input && params.get('q')) {
        input.value = params.get('q');
      }
      if (sort && params.get('sort')) {
        sort.value = params.get('sort');
      }

      function applySearch() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var selectedRegion = region ? region.value : '';
        var selectedType = type ? type.value : '';
        var selectedSort = sort ? sort.value : 'default';
        var visibleCards = [];

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardRegion = card.getAttribute('data-region') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visibleCards.push(card);
          }
        });

        if (container) {
          visibleCards.sort(function (a, b) {
            if (selectedSort === 'year') {
              return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (selectedSort === 'score') {
              return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
            }
            if (selectedSort === 'title') {
              return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
            }
            return 0;
          });
          visibleCards.forEach(function (card) {
            container.appendChild(card);
          });
        }
      }

      [input, region, type, sort].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applySearch);
          element.addEventListener('change', applySearch);
        }
      });

      applySearch();
    }
  });
}());
