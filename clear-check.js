(function () {
  const form = document.querySelector("[data-clear-form]");
  const message = document.querySelector("[data-clear-message]");
  const result = document.querySelector("[data-clear-result]");
  const copyButton = document.querySelector("[data-clear-copy]");
  const copyToast = document.querySelector("[data-clear-copy-toast]");
  const select = document.querySelector("[data-clear-select]");
  const copyText = "解毒薬を手に入れた";
  let toastTimer = null;

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
    hideCopyToast();
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
    hideCopyToast();
  }

  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      const copied = await copyToClipboard(copyText);
      if (copied) {
        showCopyToast("コピーしました", true, 1800);
        return;
      }

      showCopyToast("コピーが正常にできませんでした。お手数ですが手動でLINEにご入力ください", false, 6500);
    });
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        return fallbackCopy(text);
      }
    }

    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.left = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  }

  function showCopyToast(text, isSuccess, duration) {
    if (!copyToast) {
      return;
    }

    window.clearTimeout(toastTimer);
    copyToast.textContent = text;
    copyToast.hidden = false;
    copyToast.classList.toggle("is-error", !isSuccess);

    toastTimer = window.setTimeout(function () {
      copyToast.hidden = true;
      copyToast.textContent = "";
      copyToast.classList.remove("is-error");
    }, duration);
  }

  function hideCopyToast() {
    if (!copyToast) {
      return;
    }

    window.clearTimeout(toastTimer);
    copyToast.hidden = true;
    copyToast.textContent = "";
    copyToast.classList.remove("is-error");
  }
})();
