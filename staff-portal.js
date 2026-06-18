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
    const arc = randomBetween(14, 24);
    const arcDirection = randomBetween(0, 1) === 0 ? -1 : 1;
    const arcOffset = arc * arcDirection;
    const quarterX = Math.round(travel * 0.25);
    const quarterY = Math.round(rise * 0.25) + Math.round(arcOffset * 0.72);
    const midX = Math.round(travel * 0.52);
    const midY = Math.round(rise * 0.52) + arcOffset;
    const threeQuarterX = Math.round(travel * 0.76);
    const threeQuarterY = Math.round(rise * 0.76) + Math.round(arcOffset * 0.72);
    const finalTransform = `translate(${travel}px, ${rise}px) rotate(${rotation}deg) scale(0.98)`;

    hallucinationInsect.classList.remove("is-visible");
    hallucinationInsect.classList.remove("is-fading");
    void hallucinationInsect.offsetWidth;
    hallucinationInsect.style.width = `${size}px`;
    hallucinationInsect.style.left = `${x}vw`;
    hallucinationInsect.style.top = `${y}vh`;
    hallucinationInsect.style.setProperty("--bee-rotation", `${rotation}deg`);
    hallucinationInsect.style.setProperty("--bee-travel-x", `${travel}px`);
    hallucinationInsect.style.setProperty("--bee-travel-y", `${rise}px`);
    hallucinationInsect.style.setProperty("--bee-quarter-x", `${quarterX}px`);
    hallucinationInsect.style.setProperty("--bee-quarter-y", `${quarterY}px`);
    hallucinationInsect.style.setProperty("--bee-mid-x", `${midX}px`);
    hallucinationInsect.style.setProperty("--bee-mid-y", `${midY}px`);
    hallucinationInsect.style.setProperty("--bee-three-quarter-x", `${threeQuarterX}px`);
    hallucinationInsect.style.setProperty("--bee-three-quarter-y", `${threeQuarterY}px`);
    hallucinationInsect.style.transform = `rotate(${rotation}deg) scale(0.94)`;
    hallucinationInsect.hidden = false;
    hallucinationInsect.classList.add("is-visible");

    window.setTimeout(function () {
      hallucinationInsect.style.transform = finalTransform;
      hallucinationInsect.classList.remove("is-visible");
      hallucinationInsect.classList.add("is-fading");
      window.setTimeout(function () {
        hallucinationInsect.classList.remove("is-fading");
        hallucinationInsect.hidden = true;
      }, 320);
    }, randomBetween(2150, 2450));
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();
