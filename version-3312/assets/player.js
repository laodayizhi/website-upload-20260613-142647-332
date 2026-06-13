document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("movie-video");
  var play = document.getElementById("video-play");
  if (!video || !play) return;

  var sourceUrl = play.getAttribute("data-play");
  var hlsInstance = null;
  var attached = false;

  function attachSource() {
    if (attached || !sourceUrl) return;
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function startPlayback(event) {
    if (event) event.preventDefault();
    attachSource();
    play.classList.add("is-hidden");
    video.controls = true;
    var request = video.play();
    if (request && typeof request.catch === "function") {
      request.catch(function () {});
    }
  }

  play.addEventListener("click", startPlayback);
  video.addEventListener("click", function (event) {
    if (!attached) {
      startPlayback(event);
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
});
