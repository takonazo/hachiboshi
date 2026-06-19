(function () {
  const storageKey = "hachiboshiNewsletterJuneUnlocked";
  let started = false;
  let insect = null;
  let animationFrame = null;
  let fadeTimeout = null;

  if (isUnlocked()) {
    startHallucinations(randomBetween(12000, 22000));
  }

  window.addEventListener("hachiboshiNewsletterUnlocked", function () {
    startHallucinations(1800);
  });

  function startHallucinations(initialDelay) {
    if (started || !isUnlocked()) {
      return;
    }

    started = true;
    insect = createInsect();
    scheduleHallucination(initialDelay);
  }

  function scheduleHallucination(delay) {
    window.setTimeout(function () {
      if (document.hidden) {
        scheduleHallucination(randomBetween(80000, 153000));
        return;
      }

      showHallucination();
      scheduleHallucination(randomBetween(80000, 153000));
    }, delay);
  }

  function showHallucination() {
    if (!insect) {
      return;
    }

    const size = randomBetween(56, 86);
    const x = randomBetween(4, 78);
    const y = randomBetween(18, 84);
    const rotation = randomBetween(-5, 5);
    const travel = randomBetween(72, 108);
    const rise = -Math.round(travel * randomBetween(48, 56) / 100);
    const duration = randomBetween(1900, 2300);
    const frameDuration = 1000 / 30;
    const totalFrames = Math.max(1, Math.round(duration / frameDuration));
    const startTime = performance.now();
    const finalTransform = makeBeeTransform(travel, rise, rotation, 0.98);

    insect.classList.remove("is-visible");
    insect.classList.remove("is-fading");
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (fadeTimeout) {
      clearTimeout(fadeTimeout);
      fadeTimeout = null;
    }

    insect.style.width = `${size}px`;
    insect.style.left = `${x}vw`;
    insect.style.top = `${y}vh`;
    insect.style.transform = makeBeeTransform(0, 0, rotation, 0.94);
    insect.hidden = false;
    insect.classList.add("is-visible");

    function renderFrame(now) {
      const elapsed = now - startTime;
      const frame = Math.min(Math.floor(elapsed / frameDuration), totalFrames);
      const progress = frame / totalFrames;
      const xOffset = travel * progress;
      const yOffset = rise * progress;
      const scale = 0.96 + progress * 0.02;

      insect.style.transform = makeBeeTransform(xOffset, yOffset, rotation, scale);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(renderFrame);
        return;
      }

      insect.style.transform = finalTransform;
      insect.classList.remove("is-visible");
      insect.classList.add("is-fading");
      fadeTimeout = window.setTimeout(function () {
        insect.classList.remove("is-fading");
        insect.hidden = true;
        animationFrame = null;
        fadeTimeout = null;
      }, 360);
    }

    animationFrame = requestAnimationFrame(renderFrame);
  }

  function createInsect() {
    const img = document.createElement("img");
    img.className = "hallucination-insect";
    img.src = "assets/realbee.png";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.hidden = true;
    document.body.appendChild(img);
    return img;
  }

  function isUnlocked() {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeBeeTransform(x, y, rotation, scale) {
    return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) rotate(${rotation}deg) scale(${scale.toFixed(3)})`;
  }
})();
