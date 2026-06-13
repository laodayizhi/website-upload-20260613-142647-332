(function () {
    'use strict';

    var root = document.documentElement.getAttribute('data-root') || '';

    function getAbsoluteUrl(path) {
        if (!path) {
            return '#';
        }
        if (/^(https?:)?\/\//.test(path)) {
            return path;
        }
        return root + path;
    }

    function getImageUrl(fileName) {
        return root + fileName;
    }

    function setupMobileNavigation() {
        var button = document.getElementById('mobileMenuButton');
        var nav = document.getElementById('mobileNav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupBackToTop() {
        var button = document.getElementById('backToTop');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function renderSearchResults(input, box) {
        var query = input.value.trim().toLowerCase();
        if (!query || !window.MOVIE_INDEX) {
            box.innerHTML = '';
            box.classList.remove('open');
            return;
        }

        var results = window.MOVIE_INDEX.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.code
            ].join(' ').toLowerCase();
            return haystack.indexOf(query) !== -1;
        }).slice(0, 12);

        if (!results.length) {
            box.innerHTML = '<div class="search-result-empty">没有找到匹配影片</div>';
            box.classList.add('open');
            return;
        }

        box.innerHTML = results.map(function (movie) {
            return [
                '<a class="search-result-item" href="' + getAbsoluteUrl(movie.url) + '">',
                '    <img src="' + getImageUrl(movie.image) + '" alt="' + escapeHtml(movie.title) + '">',
                '    <span>',
                '        <strong>' + escapeHtml(movie.title) + '</strong>',
                '        <small>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year + ' · ' + movie.genre) + '</small>',
                '    </span>',
                '    <em>' + Number(movie.score).toFixed(1) + '</em>',
                '</a>'
            ].join('');
        }).join('');
        box.classList.add('open');
    }

    function setupGlobalSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('#globalSearch, .hero-search-input'));
        var box = document.getElementById('globalSearchResults');
        if (!inputs.length || !box) {
            return;
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                renderSearchResults(input, box);
            });
            input.addEventListener('focus', function () {
                renderSearchResults(input, box);
            });
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    input.blur();
                    box.classList.remove('open');
                }
            });
        });

        document.addEventListener('click', function (event) {
            var clickedInsideSearch = event.target.closest('.search-shell') ||
                event.target.closest('.hero-search-card') ||
                event.target.closest('#globalSearchResults');
            if (!clickedInsideSearch) {
                box.classList.remove('open');
            }
        });
    }

    function setupHeroSlider() {
        var hero = document.getElementById('homeHero');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-index') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCategoryFilters() {
        var grid = document.getElementById('categoryMovieGrid');
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var keyword = document.getElementById('localKeyword');
        var region = document.getElementById('regionFilter');
        var type = document.getElementById('typeFilter');
        var year = document.getElementById('yearFilter');
        var reset = document.getElementById('resetFilters');
        var count = document.getElementById('filterCount');

        function apply() {
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();

                var ok = true;
                if (keywordValue && text.indexOf(keywordValue) === -1) {
                    ok = false;
                }
                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    ok = false;
                }
                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    ok = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keyword) {
                    keyword.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (year) {
                    year.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function setupPlayer() {
        var video = document.getElementById('moviePlayer');
        var wrap = document.querySelector('.player-wrap');
        var overlay = document.getElementById('playerOverlay');
        if (!video || !wrap) {
            return;
        }

        var source = wrap.getAttribute('data-video-src');
        var hlsInstance = null;

        if (source && window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (_eventName, data) {
                if (data && data.fatal) {
                    console.error('HLS fatal error:', data);
                }
            });
        } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (source) {
            video.src = source;
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function (error) {
                    console.warn('Video playback needs user interaction:', error);
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('hidden');
                playVideo();
            });
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNavigation();
        setupBackToTop();
        setupGlobalSearch();
        setupHeroSlider();
        setupCategoryFilters();
        setupPlayer();
    });
})();
