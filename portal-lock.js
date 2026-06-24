(function () {
  const gate = document.querySelector("[data-password-gate]");

  if (!gate) {
    return;
  }

  const form = gate.querySelector("[data-password-form]");
  const input = gate.querySelector("[data-password-input]");
  const error = gate.querySelector("[data-password-error]");
  const content = gate.querySelector("[data-locked-content]");
  const failedHint = gate.querySelector("[data-password-failed-text]");
  const passwords = (gate.dataset.password || "").split("|").map(normalize).filter(Boolean);
  const storageKey = gate.dataset.sessionKey || "";
  const defaultErrorText = error ? error.textContent : "";
  const specialErrorValue = normalize(gate.dataset.specialErrorValue || "");
  const specialErrorMessage = gate.dataset.specialErrorMessage || defaultErrorText;

  if (!form || !input || !content) {
    return;
  }

  revealUnlockedText();

  if (storageKey && isUnlocked(storageKey)) {
    persistUnlock(storageKey);
    unlock();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const submittedPassword = normalize(input.value);

    if (passwords.includes(submittedPassword)) {
      const alreadyUnlocked = storageKey ? isUnlocked(storageKey) : false;
      if (storageKey) {
        persistUnlock(storageKey);
        if (!alreadyUnlocked) {
          queueRestorationNotification(storageKey);
        }
      }
      unlock();
      return;
    }

    if (error) {
      error.textContent = specialErrorValue && submittedPassword === specialErrorValue
        ? specialErrorMessage
        : defaultErrorText;
      error.hidden = false;
    }
    if (failedHint) {
      failedHint.textContent = failedHint.dataset.passwordFailedText || "";
    }
  });

  function unlock() {
    form.hidden = true;
    content.hidden = false;
    if (error) {
      error.hidden = true;
    }
  }

  function normalize(value) {
    return String(value).replace(/[　\s]+/g, " ").trim().toLowerCase();
  }

  function isUnlocked(key) {
    try {
      return sessionStorage.getItem(key) === "unlocked" || localStorage.getItem(key) === "unlocked";
    } catch (error) {
      return sessionStorage.getItem(key) === "unlocked";
    }
  }

  function persistUnlock(key) {
    try {
      sessionStorage.setItem(key, "unlocked");
      localStorage.setItem(key, "unlocked");
    } catch (error) {
      sessionStorage.setItem(key, "unlocked");
    }
  }

  function revealUnlockedText() {
    document.querySelectorAll("[data-reveal-key][data-reveal-text]").forEach(function (element) {
      if (isUnlocked(element.dataset.revealKey || "")) {
        element.textContent = element.dataset.revealText || "";
      }
    });
  }

  function queueRestorationNotification(key) {
    const seenKeys = {
      hachiboshiNewMaterialUnlocked: "hachiboshiRestorationNoticeNewMaterialSeen",
      hachiboshiProjectMeteorUnlocked: "hachiboshiRestorationNoticeProjectMeteorSeen"
    };
    const seenKey = seenKeys[key];

    if (!seenKey) {
      return;
    }

    try {
      localStorage.removeItem(seenKey);
    } catch (error) {
      return;
    }
  }
})();
