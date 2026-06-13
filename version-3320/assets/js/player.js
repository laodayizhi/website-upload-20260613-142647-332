function initMoviePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  if (!video || !sourceUrl) {
    return;
  }
  var box = video.closest('.player-box');
  var layer = box ? box.querySelector('[data-play-layer]') : null;
  var attached = false;
  var hls = null;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = sourceUrl;
  }

  function playVideo() {
    attachSource();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (layer) {
          layer.classList.remove('is-hidden');
        }
      });
    }
  }

  if (layer) {
    layer.addEventListener('click', playVideo);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
