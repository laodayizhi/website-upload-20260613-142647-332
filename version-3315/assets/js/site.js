(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupPosterFallbacks() {
        document.querySelectorAll("[data-poster-image]").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function setActive(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setActive(activeIndex + 1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                setActive(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function setupLocalFilters() {
        var toolbars = document.querySelectorAll("[data-local-toolbar]");
        toolbars.forEach(function (toolbar) {
            var input = toolbar.querySelector("[data-local-filter]");
            var yearSelect = toolbar.querySelector("[data-local-year]");
            var list = document.querySelector("[data-card-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

            function apply() {
                var keyword = text(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "";
                cards.forEach(function (card) {
                    var haystack = text([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.genre
                    ].join(" "));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || card.dataset.year === year;
                    card.hidden = !(matchKeyword && matchYear);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
        });
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var trigger = player.querySelector("[data-player-trigger]");
            var message = player.querySelector("[data-player-message]");
            var source = player.dataset.videoSrc;
            var initialized = false;
            var hls = null;

            if (!video || !trigger) {
                return;
            }

            function showMessage(value) {
                if (message) {
                    message.textContent = value || "";
                }
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        showMessage("浏览器阻止了自动播放，请在播放器控制栏中再次点击播放。");
                    });
                }
            }

            function initialize() {
                if (!source) {
                    showMessage("当前影片没有可用播放源。");
                    return;
                }
                player.classList.add("is-playing");
                showMessage("正在加载播放源…");

                if (initialized) {
                    playVideo();
                    return;
                }
                initialized = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        showMessage("");
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage("播放源加载失败，请刷新页面或稍后重试。");
                            if (hls) {
                                hls.destroy();
                                hls = null;
                            }
                        }
                    });
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        showMessage("");
                        playVideo();
                    }, { once: true });
                    return;
                }

                video.src = source;
                showMessage("当前浏览器不支持 HLS.js，已尝试使用原生播放方式。");
                playVideo();
            }

            trigger.addEventListener("click", initialize);
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\" data-movie-card>" +
                "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\">" +
                    "<img class=\"poster-image\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + " 封面\" loading=\"lazy\" data-poster-image>" +
                    "<span class=\"poster-gradient\"></span>" +
                    "<span class=\"poster-category\">" + escapeHtml(movie.categoryShort || movie.category || "影片") + "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p class=\"movie-line\">" + escapeHtml(movie.oneLine || "") + "</p>" +
                    "<div class=\"movie-meta\">" +
                        "<span>" + escapeHtml(movie.year) + "</span>" +
                        "<span>" + escapeHtml(movie.region) + "</span>" +
                        "<span>" + escapeHtml(movie.type) + "</span>" +
                    "</div>" +
                    "<div class=\"movie-tags\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var panel = document.querySelector("[data-search-panel]");
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var loadMore = document.querySelector("[data-load-more]");
        if (!panel || !results || !summary || !window.SEARCH_INDEX) {
            return;
        }

        var input = panel.querySelector("[data-search-input]");
        var category = panel.querySelector("[data-search-category]");
        var sort = panel.querySelector("[data-search-sort]");
        var params = new URLSearchParams(window.location.search);
        var visibleCount = 48;
        var currentItems = [];

        if (input) {
            input.value = params.get("q") || "";
        }
        if (category) {
            category.value = params.get("category") || "";
        }
        if (sort) {
            sort.value = params.get("sort") || "hot";
        }

        function applySearch(resetCount) {
            if (resetCount) {
                visibleCount = 48;
            }
            var keyword = text(input ? input.value : "");
            var categoryValue = category ? category.value : "";
            var sortValue = sort ? sort.value : "hot";

            currentItems = window.SEARCH_INDEX.filter(function (movie) {
                var haystack = text([
                    movie.title,
                    movie.oneLine,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.category
                ].join(" "));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchCategory = !categoryValue || movie.category === categoryValue;
                return matchKeyword && matchCategory;
            });

            currentItems.sort(function (a, b) {
                if (sortValue === "year") {
                    return (b.yearNumber - a.yearNumber) || (b.views - a.views);
                }
                if (sortValue === "title") {
                    return a.title.localeCompare(b.title, "zh-Hans-CN");
                }
                return (b.views - a.views) || (b.yearNumber - a.yearNumber);
            });

            renderResults();
        }

        function renderResults() {
            var visible = currentItems.slice(0, visibleCount);
            results.innerHTML = visible.map(movieCardTemplate).join("");
            setupPosterFallbacks();
            summary.textContent = "共找到 " + currentItems.length + " 部影片，当前显示 " + visible.length + " 部。";
            if (loadMore) {
                loadMore.hidden = visible.length >= currentItems.length;
            }
        }

        panel.addEventListener("submit", function (event) {
            event.preventDefault();
            applySearch(true);
        });

        [input, category, sort].forEach(function (control) {
            if (control) {
                control.addEventListener("input", function () {
                    applySearch(true);
                });
                control.addEventListener("change", function () {
                    applySearch(true);
                });
            }
        });

        if (loadMore) {
            loadMore.addEventListener("click", function () {
                visibleCount += 48;
                renderResults();
            });
        }

        applySearch(true);
    }

    ready(function () {
        setupMobileMenu();
        setupPosterFallbacks();
        setupHeroSlider();
        setupLocalFilters();
        setupPlayers();
        setupSearchPage();
    });
}());
