(function () {
  const palette = [
    { name: "red", value: "#d83a38" },
    { name: "blue", value: "#0b5cab" },
    { name: "yellow", value: "#f2c94c" },
    { name: "green", value: "#41a36c" },
    { name: "purple", value: "#7550b8" },
    { name: "black", value: "#15191d" },
    { name: "white", value: "#ffffff" }
  ];
  const answer = ["blue", "green", "white", "yellow"];
  const slots = Array.from(document.querySelectorAll("[data-slot]"));
  const checkButton = document.querySelector("[data-check-colors]");
  const message = document.querySelector("[data-color-message]");
  const content = document.querySelector("[data-newsletter-content]");
  const gate = document.querySelector("[data-color-gate]");
  const storageKey = "hachiboshiNewsletterJuneUnlocked";
  const indexes = [0, 0, 0, 0];

  if (readUnlockedState() === "true") {
    unlock(false);
    return;
  }

  slots.forEach(function (slot, slotIndex) {
    const square = slot.querySelector("[data-square]");
    const buttons = slot.querySelectorAll("[data-step]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const direction = button.dataset.step === "prev" ? -1 : 1;
        indexes[slotIndex] = wrap(indexes[slotIndex] + direction);
        paint(square, indexes[slotIndex]);
      });
    });
    paint(square, indexes[slotIndex]);
  });

  if (checkButton) {
    checkButton.addEventListener("click", function () {
      const selected = indexes.map(function (index) {
        return palette[index].name;
      });
      const matched = selected.every(function (color, index) {
        return color === answer[index];
      });

      if (matched) {
        saveUnlockedState();
        unlock(true);
        return;
      }

      message.textContent = "色の組み合わせが一致しません。";
      message.classList.remove("success");
    });
  }

  function paint(square, index) {
    const color = palette[index];
    square.style.backgroundColor = color.value;
    square.dataset.color = color.name;
  }

  function wrap(index) {
    return (index + palette.length) % palette.length;
  }

  function unlock(shouldScroll) {
    if (message) {
      message.textContent = "認証が完了しました。";
      message.classList.add("success");
    }
    if (gate) {
      gate.hidden = true;
    }
    if (content) {
      content.hidden = false;
      if (shouldScroll) {
        content.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function readUnlockedState() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveUnlockedState() {
    try {
      localStorage.setItem(storageKey, "true");
    } catch (error) {
      return;
    }
  }
})();
