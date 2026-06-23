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
      { canonical: "青", aliases: ["BLUE", "Blue", "blue", "あお", "アオ", "青", "ブルー"] }
    ],
    "6-5": [
      { canonical: "結晶", aliases: ["結晶", "けっしょう"] },
      { canonical: "緑", aliases: ["GREEN", "グリーン", "ぐりーん", "みどり", "緑", "ミドリ", "green", "Green"] },
      { canonical: "青", aliases: ["BLUE", "Blue", "blue", "あお", "アオ", "青", "ブルー"] }
    ],
    "6-7": [
      { canonical: "実験", aliases: ["実験", "じっけん"] }
    ]
  };
  const symbolChoices = ["♡", "♢", "☁", "☀", "☾", "☆"];
  const symbolAnswer = ["♢", "☆", "♡", "☀", "☾"];
  const solved = {};
  const final = document.querySelector("[data-meteor-final]");
  const completeModal = document.querySelector("[data-meteor-complete-modal]");
  const symbolLock = document.querySelector("[data-meteor-symbol-lock]");
  const symbolResult = document.querySelector("[data-meteor-symbol-result]");
  const symbolIndexes = [];
  let finalShown = false;
  let symbolSolved = false;

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
        setMessage(message, "間違っているようです。確実に正しい答えだという確信がある場合は、書き方を変えてみてください。例：ringo→APPLE、リンゴ、など", false);
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

  document.querySelectorAll("[data-meteor-symbol-slot]").forEach(function (slot, slotIndex) {
    let index = 0;
    const display = slot.querySelector("[data-symbol-display]");
    const buttons = slot.querySelectorAll("[data-symbol-step]");

    symbolIndexes[slotIndex] = index;
    renderSymbol(display, index);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (symbolSolved) {
          return;
        }
        index = wrapSymbol(index + (button.dataset.symbolStep === "prev" ? -1 : 1));
        symbolIndexes[slotIndex] = index;
        renderSymbol(display, index);
        checkSymbolAnswer();
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
    const crystalSolved = solved["6-5"].includes("結晶");
    const greenSolved = solved["6-5"].includes("緑");
    const blueSolved = solved["6-5"].includes("青");

    document.querySelectorAll("[data-meteor-v-fill='crystal']").forEach(function (fill) {
      fill.hidden = !crystalSolved;
    });
    document.querySelectorAll("[data-meteor-v-fill='6-3']").forEach(function (fill) {
      fill.hidden = !greenSolved;
    });
    document.querySelectorAll("[data-meteor-v-fill='6-4']").forEach(function (fill) {
      fill.hidden = !blueSolved;
    });
  }

  function maybeShowFinalReveal() {
    if (finalShown || !symbolSolved || !isPuzzleComplete("6-5") || !isPuzzleComplete("6-7")) {
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

  function checkSymbolAnswer() {
    const selected = symbolIndexes.map(function (index) {
      return symbolChoices[index];
    });
    const matched = selected.length === symbolAnswer.length && selected.every(function (symbol, index) {
      return symbol === symbolAnswer[index];
    });

    if (!matched) {
      return;
    }

    symbolSolved = true;
    if (symbolLock) {
      symbolLock.classList.add("is-complete");
      symbolLock.querySelectorAll("button").forEach(function (button) {
        button.disabled = true;
      });
    }
    if (symbolResult) {
      symbolResult.hidden = false;
    }
    maybeShowFinalReveal();
  }

  function wrapSymbol(index) {
    return (index + symbolChoices.length) % symbolChoices.length;
  }
})();
