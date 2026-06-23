(function () {
  const form = document.querySelector("[data-clear-form]");
  const message = document.querySelector("[data-clear-message]");
  const result = document.querySelector("[data-clear-result]");
  const copyButton = document.querySelector("[data-clear-copy]");
  const copyToast = document.querySelector("[data-clear-copy-toast]");
  const select = document.querySelector("[data-clear-select]");
  const helpOpenButton = document.querySelector("[data-clear-help-open]");
  const helpModal = document.querySelector("[data-clear-help-modal]");
  const helpCloseButtons = document.querySelectorAll("[data-clear-help-close]");
  const helpToggleButtons = document.querySelectorAll("[data-clear-help-toggle]");
  const helpShowButtons = document.querySelectorAll("[data-clear-help-show]");
  const copyText = "解毒薬を手に入れた";
  const helpReveals = {
    vii: {
      caption: "Ⅵの紙を水に浸けると、文字が浮かび上がってきた！",
      src: "assets/clear-help-vii.png",
      alt: "水に浸けた紙に解毒薬の調合手順が浮かび上がっている"
    },
    vi: {
      caption: "調合手順に従うと、画像のようになった！",
      src: "assets/clear-help-vi.png",
      alt: "青く光る液体が入った試験管"
    }
  };
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
      ["混ぜろ", "混ぜる", "まぜろ", "まぜる"].includes(answers.action);
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

  if (helpOpenButton && helpModal) {
    helpOpenButton.addEventListener("click", function () {
      helpModal.hidden = false;
    });
  }

  helpCloseButtons.forEach(function (button) {
    button.addEventListener("click", closeHelpModal);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeHelpModal();
    }
  });

  helpToggleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const key = button.dataset.clearHelpToggle;
      const detail = document.querySelector(`[data-clear-help-detail="${key}"]`);
      if (!detail) {
        return;
      }

      const opening = detail.hidden;
      detail.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
    });
  });

  helpShowButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      revealHelpImage(button.dataset.clearHelpShow);
    });
  });

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

  function closeHelpModal() {
    if (helpModal) {
      helpModal.hidden = true;
    }
  }

  function revealHelpImage(key) {
    const reveal = helpReveals[key];
    const detail = document.querySelector(`[data-clear-help-detail="${key}"]`);
    if (!reveal || !detail) {
      return;
    }

    detail.innerHTML = [
      `<p class="clear-help-caption">${reveal.caption}</p>`,
      `<img class="clear-help-image" src="${reveal.src}" alt="${reveal.alt}">`
    ].join("");
  }
})();
