(function () {
  "use strict";

  const STORAGE_KEY = "matsuyama-golden-turtle-clear-v1";
  const SHARE_TEXT = [
    "松山城にかくれた伝説の「金の亀」にたどり着いた！",
    "親子で挑戦 おうちで謎解き、クリア！",
    "#松山城謎解き #金の亀発見"
  ].join("\n");

  const clearDate = document.querySelector("[data-clear-date]");
  const clearId = document.querySelector("[data-clear-id]");
  const nativeShareButton = document.querySelector("[data-share-native]");
  const xShareLink = document.querySelector("[data-share-x]");
  const lineShareLink = document.querySelector("[data-share-line]");
  const copyShareButton = document.querySelector("[data-copy-share]");
  const downloadButton = document.querySelector("[data-download-card]");
  const toast = document.querySelector("[data-toast]");
  const coverModal = document.querySelector("[data-cover-modal]");
  const coverOpenButton = document.querySelector("[data-cover-open]");
  const coverCloseButtons = document.querySelectorAll("[data-cover-close]");
  let toastTimer = 0;

  const record = loadOrCreateRecord();
  renderRecord(record);
  setShareLinks();
  createGoldParticles();
  observeRevealItems();

  if (nativeShareButton) {
    nativeShareButton.addEventListener("click", shareFromDevice);
  }

  if (copyShareButton) {
    copyShareButton.addEventListener("click", async function () {
      const didCopy = await copyText(buildCopyText());
      showToast(didCopy ? "投稿文をコピーしました" : "コピーできませんでした。長押しで文章を選択してください");
    });
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      downloadButton.disabled = true;
      downloadButton.setAttribute("aria-busy", "true");

      window.setTimeout(function () {
        try {
          downloadClearCard(record);
          showToast("クリア証の画像を保存しました");
        } catch (error) {
          showToast("画像を作成できませんでした。スクリーンショットで保存してください");
        } finally {
          downloadButton.disabled = false;
          downloadButton.removeAttribute("aria-busy");
        }
      }, 120);
    });
  }

  if (coverOpenButton && coverModal) {
    coverOpenButton.addEventListener("click", openCoverModal);
  }

  coverCloseButtons.forEach(function (button) {
    button.addEventListener("click", closeCoverModal);
  });

  if (coverModal) {
    coverModal.addEventListener("click", function (event) {
      if (event.target === coverModal) {
        closeCoverModal();
      }
    });

    coverModal.addEventListener("close", function () {
      document.body.classList.remove("is-modal-open");
    });
  }

  function loadOrCreateRecord() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.date && saved.id) {
        return saved;
      }
    } catch (error) {
      // Storage may be blocked in privacy modes. The page still works without it.
    }

    const now = new Date();
    const dateKey = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join("");
    const newRecord = {
      date: now.toISOString(),
      id: "MYJ-" + dateKey + "-" + createShortCode()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecord));
    } catch (error) {
      // Continue with the in-memory record when localStorage is unavailable.
    }

    return newRecord;
  }

  function renderRecord(currentRecord) {
    const date = new Date(currentRecord.date);
    const formatted = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);

    if (clearDate) {
      clearDate.textContent = formatted;
    }

    if (clearId) {
      clearId.textContent = currentRecord.id;
    }
  }

  function createShortCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const values = new Uint8Array(4);

    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let index = 0; index < values.length; index += 1) {
        values[index] = Math.floor(Math.random() * 256);
      }
    }

    return Array.from(values, function (value) {
      return characters[value % characters.length];
    }).join("");
  }

  function setShareLinks() {
    const currentUrl = getShareUrl();

    if (xShareLink) {
      const xUrl = new URL("https://twitter.com/intent/tweet");
      xUrl.searchParams.set("text", SHARE_TEXT);
      if (currentUrl) {
        xUrl.searchParams.set("url", currentUrl);
      }
      xShareLink.href = xUrl.toString();
    }

    if (lineShareLink) {
      const lineMessage = currentUrl ? SHARE_TEXT + "\n" + currentUrl : SHARE_TEXT;
      lineShareLink.href = "https://line.me/R/share?text=" + encodeURIComponent(lineMessage);
      lineShareLink.target = "_blank";
      lineShareLink.rel = "noopener noreferrer";
    }
  }

  async function shareFromDevice() {
    const currentUrl = getShareUrl();
    const shareData = {
      title: "松山城の伝説の金の亀にたどり着いた！",
      text: SHARE_TEXT
    };

    if (currentUrl) {
      shareData.url = currentUrl;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }
    }

    const didCopy = await copyText(buildCopyText());
    showToast(didCopy ? "共有用の文章をコピーしました" : "共有機能を開けませんでした");
  }

  function getShareUrl() {
    if (!/^https?:$/.test(window.location.protocol)) {
      return "";
    }

    const url = new URL(window.location.href);
    url.hash = "";
    return url.toString();
  }

  function buildCopyText() {
    const currentUrl = getShareUrl();
    return currentUrl ? SHARE_TEXT + "\n" + currentUrl : SHARE_TEXT;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Use the selection fallback below.
      }
    }

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

  function showToast(message) {
    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 3000);
  }

  function createGoldParticles() {
    const container = document.querySelector("[data-particles]");
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!container || reducedMotion) {
      return;
    }

    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 28; index += 1) {
      const particle = document.createElement("i");
      const size = 2 + Math.random() * 4;
      particle.style.left = Math.random() * 100 + "%";
      particle.style.width = size + "px";
      particle.style.height = size * (0.55 + Math.random()) + "px";
      particle.style.setProperty("--duration", 6 + Math.random() * 8 + "s");
      particle.style.setProperty("--delay", -Math.random() * 12 + "s");
      particle.style.setProperty("--drift", -45 + Math.random() * 90 + "px");
      fragment.appendChild(particle);
    }
    container.appendChild(fragment);
  }

  function observeRevealItems() {
    const items = document.querySelectorAll(".reveal-on-scroll");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -5%" });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function openCoverModal() {
    if (!coverModal) {
      return;
    }

    document.body.classList.add("is-modal-open");
    if (typeof coverModal.showModal === "function") {
      coverModal.showModal();
    } else {
      coverModal.setAttribute("open", "");
    }
  }

  function closeCoverModal() {
    if (!coverModal) {
      return;
    }

    if (typeof coverModal.close === "function" && coverModal.open) {
      coverModal.close();
    } else {
      coverModal.removeAttribute("open");
      document.body.classList.remove("is-modal-open");
    }
  }

  function downloadClearCard(currentRecord) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext("2d");

    drawCardBackground(context, canvas.width, canvas.height);
    drawCardTurtle(context, 930, 300, 1.38);
    drawCardText(context, currentRecord);

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) {
          triggerDownload(canvas.toDataURL("image/png"));
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl);
        window.setTimeout(function () {
          URL.revokeObjectURL(objectUrl);
        }, 1000);
      }, "image/png");
      return;
    }

    triggerDownload(canvas.toDataURL("image/png"));
  }

  function drawCardBackground(context, width, height) {
    const paperGradient = context.createLinearGradient(0, 0, width, height);
    paperGradient.addColorStop(0, "#fff8dc");
    paperGradient.addColorStop(.58, "#f3d67d");
    paperGradient.addColorStop(1, "#d89b21");
    context.fillStyle = paperGradient;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalAlpha = .14;
    context.strokeStyle = "#fffdf0";
    context.lineWidth = 8;
    for (let row = -25; row < height + 60; row += 52) {
      for (let column = -30; column < width + 70; column += 104) {
        const offset = (Math.floor(row / 52) % 2) * 52;
        drawWave(context, column + offset, row, 48);
      }
    }
    context.restore();

    const inkGradient = context.createLinearGradient(700, 0, width, height);
    inkGradient.addColorStop(0, "rgba(7,31,59,.88)");
    inkGradient.addColorStop(1, "#03152b");
    context.fillStyle = inkGradient;
    context.beginPath();
    context.moveTo(715, 0);
    context.lineTo(width, 0);
    context.lineTo(width, height);
    context.lineTo(650, height);
    context.bezierCurveTo(760, 485, 655, 390, 730, 290);
    context.bezierCurveTo(795, 205, 686, 114, 715, 0);
    context.closePath();
    context.fill();

    context.strokeStyle = "rgba(7,31,59,.75)";
    context.lineWidth = 3;
    context.strokeRect(22, 22, width - 44, height - 44);
    context.strokeStyle = "rgba(255,248,220,.5)";
    context.lineWidth = 1;
    context.strokeRect(31, 31, width - 62, height - 62);

    context.fillStyle = "rgba(204,23,70,.88)";
    context.beginPath();
    context.arc(1061, 103, 49, 0, Math.PI * 2);
    context.fill();
  }

  function drawWave(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, Math.PI, 0);
    context.stroke();
    context.beginPath();
    context.arc(x, y, radius * .67, Math.PI, 0);
    context.stroke();
    context.beginPath();
    context.arc(x, y, radius * .34, Math.PI, 0);
    context.stroke();
  }

  function drawCardTurtle(context, x, y, scale) {
    context.save();
    context.translate(x, y);
    context.scale(scale, scale);
    context.shadowColor = "rgba(244,209,111,.45)";
    context.shadowBlur = 30;

    const gold = context.createLinearGradient(-120, -90, 120, 100);
    gold.addColorStop(0, "#fff1a1");
    gold.addColorStop(.45, "#efc14f");
    gold.addColorStop(1, "#a96712");
    context.fillStyle = gold;

    context.beginPath();
    context.ellipse(0, 0, 100, 78, 0, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.ellipse(123, -1, 32, 27, 0, 0, Math.PI * 2);
    context.fill();

    drawLimb(context, -62, -54, -108, -100, -73, -20);
    drawLimb(context, 55, -55, 102, -103, 68, -19);
    drawLimb(context, -62, 54, -106, 105, -69, 18);
    drawLimb(context, 57, 54, 108, 100, 69, 19);

    context.beginPath();
    context.moveTo(-97, -14);
    context.lineTo(-137, 0);
    context.lineTo(-97, 15);
    context.closePath();
    context.fill();

    context.shadowBlur = 0;
    context.strokeStyle = "#fff1a1";
    context.lineWidth = 2.2;
    context.beginPath();
    context.moveTo(0, -66);
    context.lineTo(-44, 0);
    context.lineTo(0, 66);
    context.lineTo(44, 0);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.moveTo(-88, 0);
    context.lineTo(-44, 0);
    context.lineTo(0, -66);
    context.lineTo(44, 0);
    context.lineTo(88, 0);
    context.moveTo(0, 66);
    context.lineTo(44, 0);
    context.stroke();

    context.fillStyle = "#03152b";
    context.beginPath();
    context.arc(132, -8, 4, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawLimb(context, x1, y1, x2, y2, x3, y3) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.quadraticCurveTo(x2, y2, x3, y3);
    context.quadraticCurveTo(x1 + (x3 - x1) * .25, y1 + (y3 - y1) * .3, x1, y1);
    context.fill();
  }

  function drawCardText(context, currentRecord) {
    const date = new Date(currentRecord.date);
    const formatted = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);

    context.textBaseline = "alphabetic";
    context.fillStyle = "#9c6012";
    context.font = "700 18px Georgia, serif";
    context.fillText("QUEST COMPLETE  /  MATSUYAMA CASTLE", 76, 91);

    context.fillStyle = "#071f3b";
    context.font = "600 37px 'Yu Mincho', 'Hiragino Mincho ProN', serif";
    context.fillText("松山城の伝説の", 72, 170);

    context.fillStyle = "#cc1746";
    context.font = "700 78px 'Yu Mincho', 'Hiragino Mincho ProN', serif";
    context.fillText("金", 70, 277);
    context.fillStyle = "#071f3b";
    context.font = "600 65px 'Yu Mincho', 'Hiragino Mincho ProN', serif";
    context.fillText("の亀に", 153, 276);
    context.font = "600 63px 'Yu Mincho', 'Hiragino Mincho ProN', serif";
    context.fillText("たどり着いた！", 70, 365);

    context.strokeStyle = "rgba(7,31,59,.38)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(72, 410);
    context.lineTo(565, 410);
    context.stroke();

    context.fillStyle = "#415066";
    context.font = "500 22px 'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif";
    context.fillText("親子で挑戦　おうちで謎解き", 72, 459);
    context.font = "500 19px 'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif";
    context.fillText("『松山城にかくれた金の亀をさがせ！』", 72, 497);

    context.fillStyle = "#071f3b";
    context.font = "700 17px Georgia, serif";
    context.fillText(formatted + "  /  " + currentRecord.id, 72, 557);

    context.fillStyle = "#f4d16f";
    context.font = "italic 700 35px Georgia, serif";
    context.fillText("CLEAR!", 1012, 535);
  }

  function triggerDownload(url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = "matsuyama-golden-turtle-clear.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }
})();
