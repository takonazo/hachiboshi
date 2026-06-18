(function () {
  const portalAudio = document.querySelector("[data-portal-audio]");
  const portalAudioToggle = document.querySelector("[data-audio-toggle]");
  const targetVolume = 0.084;
  const fadeDuration = 4200;
  const mutedKey = "hachiboshiPortalAudioMuted";
  const timeKey = "hachiboshiPortalAudioTime";
  let audioStarted = false;
  let fadeFrame = null;
  let lastSavedAt = 0;

  if (!portalAudio) {
    return;
  }

  portalAudio.loop = true;
  portalAudio.volume = 0;
  portalAudio.muted = readMuted();
  updateToggle();
  restoreTimeWhenReady();
  startAudio();

  ["pointerdown", "keydown", "touchstart", "click"].forEach(function (eventName) {
    document.addEventListener(eventName, startAudio, { once: true, passive: true });
  });

  portalAudio.addEventListener("timeupdate", saveTimeThrottled);
  window.addEventListener("pagehide", saveTime);

  if (portalAudioToggle) {
    portalAudioToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setMuted(!portalAudio.muted);
      if (!portalAudio.muted) {
        startAudio();
      }
    });
  }

  function startAudio() {
    if (audioStarted) {
      return;
    }

    portalAudio.volume = 0;
    const playAttempt = portalAudio.play();

    if (playAttempt && typeof playAttempt.then === "function") {
      playAttempt.then(beginFade).catch(function () {
        audioStarted = false;
      });
      return;
    }

    beginFade();
  }

  function beginFade() {
    if (audioStarted) {
      return;
    }

    audioStarted = true;
    const startTime = performance.now();

    if (fadeFrame) {
      cancelAnimationFrame(fadeFrame);
    }

    function render(now) {
      const progress = Math.min((now - startTime) / fadeDuration, 1);
      portalAudio.volume = targetVolume * progress;

      if (progress < 1) {
        fadeFrame = requestAnimationFrame(render);
        return;
      }

      portalAudio.volume = targetVolume;
      fadeFrame = null;
    }

    fadeFrame = requestAnimationFrame(render);
  }

  function restoreTimeWhenReady() {
    const restore = function () {
      const savedTime = readSavedTime();
      if (savedTime <= 0 || !Number.isFinite(portalAudio.duration) || portalAudio.duration <= 0) {
        return;
      }
      portalAudio.currentTime = savedTime % portalAudio.duration;
    };

    if (portalAudio.readyState >= 1) {
      restore();
      return;
    }

    portalAudio.addEventListener("loadedmetadata", restore, { once: true });
  }

  function saveTimeThrottled() {
    const now = Date.now();
    if (now - lastSavedAt < 1000) {
      return;
    }

    lastSavedAt = now;
    saveTime();
  }

  function saveTime() {
    try {
      localStorage.setItem(timeKey, String(portalAudio.currentTime || 0));
    } catch (error) {
      return;
    }
  }

  function readSavedTime() {
    try {
      return Number(localStorage.getItem(timeKey) || 0);
    } catch (error) {
      return 0;
    }
  }

  function setMuted(muted) {
    portalAudio.muted = muted;
    saveMuted(muted);
    updateToggle();
  }

  function updateToggle() {
    if (!portalAudioToggle) {
      return;
    }

    const muted = portalAudio.muted;
    portalAudioToggle.classList.toggle("is-muted", muted);
    portalAudioToggle.setAttribute("aria-label", muted ? "BGMのミュートを解除" : "BGMをミュート");
    portalAudioToggle.setAttribute("title", muted ? "BGMのミュートを解除" : "BGMをミュート");
  }

  function readMuted() {
    try {
      return localStorage.getItem(mutedKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function saveMuted(muted) {
    try {
      localStorage.setItem(mutedKey, String(muted));
    } catch (error) {
      return;
    }
  }
})();
