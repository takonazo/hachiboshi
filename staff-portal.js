(function () {
  const validIds = ["hoshino.toru", "hoshino", "星野透"];
  const validPassword = "orion-08";
  const loginPanel = document.querySelector("[data-login-panel]");
  const dashboard = document.querySelector("[data-dashboard]");
  const form = document.querySelector("[data-login-form]");
  const error = document.querySelector("[data-login-error]");
  const logout = document.querySelector("[data-logout]");

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
    });
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
  }

  function normalize(value) {
    return String(value).trim().toLowerCase();
  }
})();
