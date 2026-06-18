(function () {
  const gate = document.querySelector("[data-password-gate]");

  if (!gate) {
    return;
  }

  const form = gate.querySelector("[data-password-form]");
  const input = gate.querySelector("[data-password-input]");
  const error = gate.querySelector("[data-password-error]");
  const content = gate.querySelector("[data-locked-content]");
  const password = gate.dataset.password || "";
  const storageKey = gate.dataset.sessionKey || "";

  if (!form || !input || !content) {
    return;
  }

  if (storageKey && sessionStorage.getItem(storageKey) === "unlocked") {
    unlock();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (normalize(input.value) === normalize(password)) {
      if (storageKey) {
        sessionStorage.setItem(storageKey, "unlocked");
      }
      unlock();
      return;
    }

    if (error) {
      error.hidden = false;
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
})();
