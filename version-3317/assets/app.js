(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });

    play();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-tags") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function setupListing() {
    var page = document.querySelector("[data-listing-page]");
    if (!page) {
      return;
    }
    var cards = Array.prototype.slice.call(page.querySelectorAll("[data-movie-card]"));
    var grid = page.querySelector("[data-card-grid]");
    var empty = page.querySelector("[data-empty-state]");
    var query = page.querySelector("[data-listing-query]");
    var form = page.querySelector("[data-listing-form]");
    var sort = page.querySelector("[data-sort-select]");
    var region = page.querySelector("[data-region-select]");
    var type = page.querySelector("[data-type-select]");
    var year = page.querySelector("[data-year-select]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var initialSort = params.get("sort") || params.get("sortBy") || "";

    if (query && initialQuery) {
      query.value = initialQuery;
    }
    if (sort && initialSort) {
      sort.value = initialSort;
    }

    function matches(card) {
      var q = query ? query.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      if (q && textOf(card).indexOf(q) === -1) {
        return false;
      }
      if (r && card.getAttribute("data-region") !== r) {
        return false;
      }
      if (t && card.getAttribute("data-type") !== t) {
        return false;
      }
      if (y && card.getAttribute("data-year") !== y) {
        return false;
      }
      return true;
    }

    function compareCards(a, b) {
      var value = sort ? sort.value : "date";
      if (value === "views") {
        return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
      }
      if (value === "title") {
        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
      }
      if (value === "year") {
        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
      }
      return (b.getAttribute("data-date") || "").localeCompare(a.getAttribute("data-date") || "");
    }

    function apply() {
      var visible = 0;
      cards.sort(compareCards).forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (grid && card.parentElement === grid) {
          grid.appendChild(card);
        }
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }
    [query, sort, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.initVideoPlayer = function (source) {
    var video = document.getElementById("movie-player");
    var layer = document.querySelector(".play-layer");
    var prepared = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          var done = false;
          function finish() {
            if (!done) {
              done = true;
              resolve();
            }
          }
          hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
          window.setTimeout(finish, 1400);
        });
      }
      video.src = source;
      return Promise.resolve();
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      prepare().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      });
    }

    prepare();
    if (layer) {
      layer.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupListing();
  });
})();
