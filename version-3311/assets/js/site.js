(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var mobileToggle = document.querySelector('[data-mobile-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });

                thumbs.forEach(function (thumb, thumbIndex) {
                    thumb.classList.toggle('is-active', thumbIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            var next = hero.querySelector('[data-hero-next]');
            var prev = hero.querySelector('[data-hero-prev]');

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        });

        document.querySelectorAll('[data-card-grid]').forEach(function (grid) {
            var scope = grid.closest('main') || document;
            var input = scope.querySelector('[data-card-search]');
            var select = scope.querySelector('[data-card-category]');
            var empty = scope.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var category = select ? select.value : '';
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var cardCategory = card.getAttribute('data-category') || '';
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedCategory = !category || cardCategory === category;
                    var visible = matchedQuery && matchedCategory;

                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }

            if (select) {
                select.addEventListener('change', applyFilter);
            }

            applyFilter();
        });

        document.querySelectorAll('.movie-player').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-start');
            var src = player.getAttribute('data-src');
            var started = false;
            var hlsInstance = null;

            function attachAndPlay() {
                if (!video || !src) {
                    return;
                }

                if (!started) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = src;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = src;
                    }

                    started = true;
                }

                player.classList.add('is-playing');
                var playResult = video.play();

                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', attachAndPlay);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!started) {
                        attachAndPlay();
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
