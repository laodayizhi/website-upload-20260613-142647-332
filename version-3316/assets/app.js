(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
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
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                stop();
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var category = document.querySelector("[data-filter-category]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }
        function matches(card) {
            var text = normalize(card.getAttribute("data-search"));
            var q = normalize(input ? input.value : "");
            var categoryValue = normalize(category ? category.value : "");
            var typeValue = normalize(type ? type.value : "");
            var yearValue = normalize(year ? year.value : "");
            if (q && text.indexOf(q) === -1) {
                return false;
            }
            if (categoryValue && normalize(card.getAttribute("data-category")) !== categoryValue) {
                return false;
            }
            if (typeValue && normalize(card.getAttribute("data-type")).indexOf(typeValue) === -1) {
                return false;
            }
            if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                return false;
            }
            return true;
        }
        function apply() {
            lists.forEach(function (list) {
                Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")).forEach(function (card) {
                    card.classList.toggle("is-hidden", !matches(card));
                });
            });
        }
        [input, category, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    function loadHlsScript(callback) {
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            existing.addEventListener("error", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        script.addEventListener("error", callback, { once: true });
        document.head.appendChild(script);
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".player-overlay");
            var url = shell.getAttribute("data-video-url");
            var attached = false;
            var hlsInstance = null;
            if (!video || !button || !url) {
                return;
            }
            function attach(callback) {
                if (attached) {
                    callback();
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    attached = true;
                    callback();
                    return;
                }
                function useHls() {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(url);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            attached = true;
                            callback();
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function () {
                            if (!attached) {
                                video.src = url;
                                attached = true;
                                callback();
                            }
                        });
                        window.setTimeout(function () {
                            if (!attached) {
                                attached = true;
                                callback();
                            }
                        }, 1800);
                        return;
                    }
                    video.src = url;
                    attached = true;
                    callback();
                }
                if (window.Hls) {
                    useHls();
                } else {
                    loadHlsScript(useHls);
                }
            }
            function play() {
                attach(function () {
                    shell.classList.add("is-playing");
                    button.hidden = true;
                    video.controls = true;
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            button.hidden = false;
                            shell.classList.remove("is-playing");
                        });
                    }
                });
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
