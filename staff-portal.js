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
    scheduleHallucination(randomBetween(14000, 28000));
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
    const x = randomBetween(8, 82);
    const y = randomBetween(10, 76);
    const rotation = randomBetween(-28, 28);
    const direction = randomBetween(0, 1) === 0 ? -1 : 1;
    const travel = randomBetween(72, 130) * direction;
    const drift = randomBetween(-34, 34);
    const curve = randomBetween(-26, 26);

    hallucinationInsect.classList.remove("is-visible");
    void hallucinationInsect.offsetWidth;
    hallucinationInsect.style.width = `${size}px`;
    hallucinationInsect.style.left = `${x}vw`;
    hallucinationInsect.style.top = `${y}vh`;
    hallucinationInsect.style.setProperty("--bee-rotation", `${rotation}deg`);
    hallucinationInsect.style.setProperty("--bee-travel-x", `${travel}px`);
    hallucinationInsect.style.setProperty("--bee-travel-y", `${drift}px`);
    hallucinationInsect.style.setProperty("--bee-curve-y", `${curve}px`);
    hallucinationInsect.style.transform = `rotate(${rotation}deg) scale(0.94)`;
    hallucinationInsect.hidden = false;
    hallucinationInsect.classList.add("is-visible");

    window.setTimeout(function () {
      hallucinationInsect.classList.remove("is-visible");
      window.setTimeout(function () {
        hallucinationInsect.hidden = true;
      }, 320);
    }, randomBetween(1900, 2400));
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();
