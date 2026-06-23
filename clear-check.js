(function () {
  const form = document.querySelector("[data-clear-form]");
  const message = document.querySelector("[data-clear-message]");
  const result = document.querySelector("[data-clear-result]");
  const select = document.querySelector("[data-clear-select]");

  if (!form || !select || !result) {
    return;
  }

  resetForm();
  window.addEventListener("pageshow", resetForm);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const answers = {
      liquidA: getValue("liquid-a"),
      liquidB: getValue("liquid-b"),
      target: getValue("target"),
      ratio: normalizeRatio(getValue("ratio")),
      action: getValue("action")
    };

    const q1Correct =
      answers.liquidA === "3" &&
      answers.liquidB === "4" &&
      answers.target === "液体" &&
      answers.ratio === "1:1" &&
      answers.action === "混ぜろ";
    const q2Correct = select.value === "光った";

    if (q1Correct && q2Correct) {
      setMessage("判定が完了しました。", true);
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setMessage("入力内容を確認してください。", false);
    result.hidden = true;
  });

  function getValue(name) {
    const input = form.querySelector(`[data-clear-input="${name}"]`);
    return normalize(input ? input.value : "");
  }

  function normalize(value) {
    return String(value)
      .normalize("NFKC")
      .replace(/[　\s]+/g, "")
      .trim();
  }

  function normalizeRatio(value) {
    return normalize(value).replace(/対/g, ":").replace(/：/g, ":");
  }

  function setMessage(text, isSuccess) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.toggle("success", isSuccess);
  }

  function resetForm() {
    form.querySelectorAll("[data-clear-input]").forEach(function (input) {
      input.value = "";
    });
    select.value = "";
    result.hidden = true;
    setMessage("", false);
  }
})();
