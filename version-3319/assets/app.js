(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));

  function applySearch(value) {
    var keyword = String(value || '').trim().toLowerCase();

    cards.forEach(function (card) {
      var content = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      card.classList.toggle('hidden-card', Boolean(keyword) && content.indexOf(keyword) === -1);
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applySearch(input.value);
    });
  });

  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

  filters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      var value = filter.getAttribute('data-filter') || '';
      var active = filter.classList.contains('active');

      filters.forEach(function (item) {
        item.classList.remove('active');
      });

      if (active || value === 'all') {
        cards.forEach(function (card) {
          card.classList.remove('hidden-card');
        });
        return;
      }

      filter.classList.add('active');
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-region') || '',
          card.textContent || ''
        ].join(' ');

        card.classList.toggle('hidden-card', text.indexOf(value) === -1);
      });
    });
  });
})();
