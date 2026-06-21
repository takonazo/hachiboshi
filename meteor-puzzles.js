(function () {
  const puzzles = {
    "6-1": [
      { canonical: "ダイヤ", aliases: ["ダイヤ", "だいや", "♢", "♦"] },
      { canonical: "ほし", aliases: ["ほし", "ホシ", "星", "☆", "★"] }
    ],
    "6-2": [
      { canonical: "ハート", aliases: ["ハート", "HEART", "heart", "Heart", "はーと", "♡"] },
      { canonical: "たいよう", aliases: ["太陽", "たいよう", "SUN", "タイヨウ", "sun", "Sun"] },
      { canonical: "つき", aliases: ["☾", "つき", "ツキ", "月", "MOON", "Moon", "moon"] }
    ],
    "6-3": [
      { canonical: "緑", aliases: ["GREEN", "グリーン", "ぐりーん", "みどり", "緑", "ミドリ", "green", "Green"] }
    ],
    "6-4": [
      { canonical: "青", aliases: ["BLUE", "Blue", "blue", "あお", "アオ", "青"] }
    ],
    "6-5": [
      { canonical: "結晶", aliases: ["結晶", "けっしょう"] },
      { canonical: "緑", aliases: ["GREEN", "グリーン", "ぐりーん", "みどり", "緑", "ミドリ", "green", "Green"] },
      { canonical: "青", aliases: ["BLUE", "Blue", "blue", "あお", "アオ", "青"] }
    ],
    "6-7": [
      { canonical: "実験", aliases: ["実験", "じっけん"] }
    ]
  };
  const symbolChoices = ["♡", "♢", "☁", "☀", "☾", "☆"];
  const solved = {};
  const final = document.querySelector("[data-meteor-final]");
  const completeModal = document.querySelector("[data-meteor-complete-modal]");
  let finalShown = false;

  Object.keys(puzzles).forEach(function (id) {
    solved[id] = [];
  });

  document.querySelectorAll("[data-meteor-puzzle]").forEach(function (card) {
    const id = card.dataset.meteorPuzzle || "";
    const form = card.querySelector("[data-meteor-answer-form]");
    const input = card.querySelector("[data-meteor-answer-input]");
    const message = card.querySelector("[data-meteor-answer-message]");
    const correct = card.querySelector("[data-meteor-answer-correct]");

    if (!form || !input || !puzzles[id]) {
      return;
    }

    renderCorrectList(id, correct);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const matched = findMatchedAnswer(id, input.value);

      if (!matched) {
        setMessage(message, "まだ一致しません。", false);
        return;
      }

      if (solved[id].includes(matched.canonical)) {
        setMessage(message, "その答えは入力済みです。", true);
        input.value = "";
        return;
      }

      solved[id].push(matched.canonical);
      setMessage(message, "正解です。", true);
      input.value = "";
      renderCorrectList(id, correct);
      updateMeteorVFill();

      if (isPuzzleComplete(id)) {
        completeForm(form, input);
      }

      maybeShowFinalReveal();
    });
  });

  document.querySelectorAll("[data-meteor-symbol-slot]").forEach(function (slot) {
    let index = 0;
    const display = slot.querySelector("[data-symbol-display]");
    const buttons = slot.querySelectorAll("[data-symbol-step]");

    renderSymbol(display, index);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        index = wrapSymbol(index + (button.dataset.symbolStep === "prev" ? -1 : 1));
        renderSymbol(display, index);
      });
    });
  });

  function findMatchedAnswer(id, value) {
    const normalized = normalize(value);
    if (!normalized) {
      return null;
    }

    return puzzles[id].find(function (group) {
      return group.aliases.some(function (alias) {
        return normalize(alias) === normalized;
      });
    }) || null;
  }

  function normalize(value) {
    return String(value)
      .normalize("NFKC")
      .replace(/[　\s]+/g, "")
      .toLowerCase();
  }

  function renderCorrectList(id, element) {
    if (!element) {
      return;
    }

    if (!solved[id].length) {
      element.textContent = "";
      return;
    }

    element.textContent = `正解：${solved[id].join("、")}`;
  }

  function setMessage(element, text, success) {
    if (!element) {
      return;
    }

    element.textContent = text;
    element.classList.toggle("success", Boolean(success));
  }

  function isPuzzleComplete(id) {
    return solved[id].length === puzzles[id].length;
  }

  function completeForm(form, input) {
    const button = form.querySelector("button");
    input.value = "完了";
    input.disabled = true;
    if (button) {
      button.disabled = true;
    }
    form.classList.add("is-complete");
  }

  function updateMeteorVFill() {
    const greenSolved = solved["6-3"].includes("緑") || solved["6-5"].includes("緑");
    const blueSolved = solved["6-4"].includes("青") || solved["6-5"].includes("青");

    document.querySelectorAll("[data-meteor-v-fill='6-3']").forEach(function (fill) {
      fill.hidden = !greenSolved;
    });
    document.querySelectorAll("[data-meteor-v-fill='6-4']").forEach(function (fill) {
      fill.hidden = !blueSolved;
    });
  }

  function maybeShowFinalReveal() {
    if (finalShown || !isPuzzleComplete("6-5") || !isPuzzleComplete("6-7")) {
      return;
    }

    finalShown = true;
    if (completeModal) {
      completeModal.hidden = false;
    }

    window.setTimeout(function () {
      if (completeModal) {
        completeModal.hidden = true;
      }
      if (final) {
        final.hidden = false;
        window.requestAnimationFrame(function () {
          final.classList.add("is-visible");
          final.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }, 1200);
  }

  function renderSymbol(display, index) {
    if (display) {
      display.textContent = symbolChoices[index];
    }
  }

  function wrapSymbol(index) {
    return (index + symbolChoices.length) % symbolChoices.length;
  }
})();
