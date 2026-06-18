(function () {
  const validIds = ["hoshino.toru", "hoshino", "星野透"];
  const validPassword = "orion-08";
  const loginPanel = document.querySelector("[data-login-panel]");
  const dashboard = document.querySelector("[data-dashboard]");
  const form = document.querySelector("[data-login-form]");
  const error = document.querySelector("[data-login-error]");
  const logout = document.querySelector("[data-logout]");
  const notificationButton = document.querySelector("[data-notification-button]");
  const notificationPanel = document.querySelector("[data-notification-panel]");
  const notificationDot = document.querySelector("[data-notification-dot]");
  const hallucinationInsect = document.querySelector("[data-hallucination-insect]");
  const notificationStorageKeys = [
    "hachiboshiNotificationsRead",
    "hachiboshiNotificationsReadV2",
    "hachiboshiNotificationsReadV3"
  ];
  let hallucinationFrame = null;

  if (!form || !loginPanel || !dashboard) {
    return;
  }

  if (sessionStorage.getItem("hachiboshiPortal") === "hoshino") {
    showDashboard();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const staffId = normalize(data.get("staffId") || "");
    const password = normalize(data.get("password") || "");
    const idMatched = validIds.some(function (id) {
      return normalize(id) === staffId;
    });

    if (idMatched && password === validPassword) {
      sessionStorage.setItem("hachiboshiPortal", "hoshino");
      showDashboard();
      return;
    }

    error.hidden = false;
  });

  if (logout) {
    logout.addEventListener("click", function () {
      sessionStorage.removeItem("hachiboshiPortal");
      dashboard.hidden = true;
      loginPanel.hidden = false;
      form.reset();
      error.hidden = true;
      hideNotifications();
    });
  }

  if (notificationButton && notificationPanel) {
    if (readNotificationState() === "true") {
      clearNotificationDot();
    }

    notificationButton.addEventListener("click", function (event) {
      event.stopPropagation();
      const opening = notificationPanel.hidden;
      notificationPanel.hidden = !opening;
      notificationButton.setAttribute("aria-expanded", String(opening));
      if (opening) {
        saveNotificationState();
        clearNotificationDot();
      }
    });

    document.addEventListener("click", function (event) {
      if (!notificationPanel.hidden && !event.target.closest("[data-notification]")) {
        hideNotifications();
      }
    });
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    startHallucinations();
  }

  function hideNotifications() {
    if (notificationPanel && notificationButton) {
      notificationPanel.hidden = true;
      notificationButton.setAttribute("aria-expanded", "false");
    }
  }

  function clearNotificationDot() {
    if (notificationDot && notificationButton) {
      notificationDot.hidden = true;
      notificationButton.classList.remove("has-unread");
      notificationButton.dataset.read = "true";
    }
  }

  function readNotificationState() {
    try {
      const hasRead = notificationStorageKeys.some(function (key) {
        return localStorage.getItem(key) === "true";
      });
      return hasRead ? "true" : null;
    } catch (error) {
      return null;
    }
  }

  function saveNotificationState() {
    try {
      notificationStorageKeys.forEach(function (key) {
        localStorage.setItem(key, "true");
      });
    } catch (error) {
      return;
    }
  }

  function normalize(value) {
    return String(value).trim().toLowerCase();
  }

  function startHallucinations() {
    if (!hallucinationInsect || hallucinationInsect.dataset.started === "true") {
      return;
    }

    hallucinationInsect.dataset.started = "true";
    scheduleHallucination(randomBetween(4000, 9000));
  }

  function scheduleHallucination(delay) {
    window.setTimeout(function () {
      if (dashboard.hidden) {
        scheduleHallucination(randomBetween(24000, 46000));
        return;
      }

      showHallucination();
      scheduleHallucination(randomBetween(24000, 46000));
    }, delay);
  }

  function showHallucination() {
    const size = randomBetween(70, 105);
    const x = randomBetween(6, 78);
    const y = randomBetween(18, 82);
    const rotation = randomBetween(-8, 8);
    const travel = randomBetween(64, 96);
    const rise = -Math.round(travel * randomBetween(42, 58) / 100);
    const arc = randomBetween(14, 22) * (randomBetween(0, 1) === 0 ? -1 : 1);
    const duration = randomBetween(2100, 2500);
    const startTime = performance.now();
    const finalTransform = makeBeeTransform(travel, rise, rotation, 0.98);

    hallucinationInsect.classList.remove("is-visible");
    hallucinationInsect.classList.remove("is-fading");
    if (hallucinationFrame) {
      cancelAnimationFrame(hallucinationFrame);
    }
    hallucinationInsect.style.width = `${size}px`;
    hallucinationInsect.style.left = `${x}vw`;
    hallucinationInsect.style.top = `${y}vh`;
    hallucinationInsect.style.transform = makeBeeTransform(0, 0, rotation, 0.94);
    hallucinationInsect.hidden = false;
    hallucinationInsect.classList.add("is-visible");

    function renderFrame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutSine(progress);
      const wave = Math.sin(Math.PI * eased) * arc;
      const xOffset = travel * eased;
      const yOffset = rise * eased + wave;
      const scale = 0.94 + Math.sin(Math.PI * eased) * 0.06 + eased * 0.04;

      hallucinationInsect.style.transform = makeBeeTransform(xOffset, yOffset, rotation, scale);

      if (progress < 1) {
        hallucinationFrame = requestAnimationFrame(renderFrame);
        return;
      }

      hallucinationInsect.style.transform = finalTransform;
      hallucinationInsect.classList.remove("is-visible");
      hallucinationInsect.classList.add("is-fading");
      window.setTimeout(function () {
        hallucinationInsect.classList.remove("is-fading");
        hallucinationInsect.hidden = true;
        hallucinationFrame = null;
      }, 360);
    }

    hallucinationFrame = requestAnimationFrame(renderFrame);
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function easeInOutSine(progress) {
    return -(Math.cos(Math.PI * progress) - 1) / 2;
  }

  function makeBeeTransform(x, y, rotation, scale) {
    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotation}deg) scale(${scale.toFixed(3)})`;
  }
})();
