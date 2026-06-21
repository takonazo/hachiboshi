(function () {
  const correctPatterns = [
    [
      ["x", "x", "o", "x", "o"],
      ["x", "x", "x", "x", "o"],
      ["o", "o", "o", "o", "x"],
      ["o", "o", "o", "o", "x"]
    ],
    [
      ["x", "x", "o", "o", "o"],
      ["x", "x", "x", "x", "o"],
      ["o", "o", "o", "o", "x"],
      ["o", "o", "o", "o", "x"]
    ]
  ];

  const cells = Array.from(document.querySelectorAll("[data-row][data-col]"));
  const markButtons = Array.from(document.querySelectorAll("[data-mark]"));
  const status = document.querySelector("[data-judgement-status]");
  const conclusion = document.querySelector("[data-judgement-conclusion]");
  const answerSelect = document.querySelector("[data-judgement-answer]");
  const helpOpen = document.querySelector("[data-help-open]");
  const helpModal = document.querySelector("[data-help-modal]");
  const saitoResult = document.querySelector("[data-saito-result]");
  const showSaito = document.querySelector("[data-show-saito]");
  const finalModal = document.querySelector("[data-final-modal]");
  let selectedCell = null;

  cells.forEach(function (cell) {
    cell.addEventListener("click", function () {
      selectCell(cell);
    });
  });

  markButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!selectedCell) {
        setStatus("記入するマスを選択してください。", "neutral");
        return;
      }

      const value = button.dataset.mark;
      selectedCell.dataset.value = value;
      selectedCell.textContent = value === "o" ? "〇" : "×";
      selectedCell.classList.add("is-filled");
      checkIfComplete();
    });
  });

  if (helpOpen && helpModal) {
    helpOpen.addEventListener("click", function () {
      helpModal.hidden = false;
    });
  }

  document.querySelectorAll("[data-modal-close]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (helpModal) {
        helpModal.hidden = true;
      }
    });
  });

  if (showSaito && saitoResult) {
    showSaito.addEventListener("click", function () {
      saitoResult.hidden = false;
    });
  }

  if (answerSelect) {
    answerSelect.addEventListener("change", function () {
      if (answerSelect.value === "この中にはない" && finalModal) {
        finalModal.hidden = false;
      }
    });
  }

  document.querySelectorAll("[data-final-close]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (finalModal) {
        finalModal.hidden = true;
      }
    });
  });

  function selectCell(cell) {
    if (selectedCell) {
      selectedCell.classList.remove("is-selected");
    }

    selectedCell = cell;
    selectedCell.classList.add("is-selected");
  }

  function checkIfComplete() {
    if (!cells.every(function (cell) { return Boolean(cell.dataset.value); })) {
      setStatus("", "neutral");
      if (conclusion) {
        conclusion.hidden = true;
      }
      return;
    }

    const current = getCurrentMatrix();
    const isCorrect = correctPatterns.some(function (pattern) {
      return matchesPattern(current, pattern);
    });

    if (isCorrect) {
      setStatus("判定結果が整理されました。", "success");
      if (conclusion) {
        conclusion.hidden = false;
      }
      return;
    }

    setStatus("斎藤も同じ実験をしたところ、一部の結果が違ったようです（謎とは関係ありません）。画面右下のヘルプの活用もご検討ください", "error");
    if (conclusion) {
      conclusion.hidden = true;
    }
  }

  function getCurrentMatrix() {
    const matrix = Array.from({ length: 4 }, function () {
      return Array.from({ length: 5 }, function () { return ""; });
    });

    cells.forEach(function (cell) {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      matrix[row][col] = cell.dataset.value || "";
    });

    return matrix;
  }

  function matchesPattern(current, pattern) {
    return pattern.every(function (row, rowIndex) {
      return row.every(function (value, colIndex) {
        return current[rowIndex][colIndex] === value;
      });
    });
  }

  function setStatus(message, type) {
    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.type = type;
  }
})();
