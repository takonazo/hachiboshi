(function () {
  const hiddenTerms = [
    "八芒星",
    "はちぼうせい",
    "八星標章",
    "HSC-08",
    "hsc-08",
    "星蜂"
  ];

  const pages = [
    {
      title: "トップページ",
      url: "index.html",
      excerpt: "八星製薬株式会社の事業内容、研究開発、会社概要を掲載しています。",
      terms: ["八星製薬", "トップ", "事業内容", "研究開発", "会社概要", "品質評価"]
    },
    {
      title: "新入社員紹介特設ページ",
      url: "new-employees.html",
      excerpt: "2026年度の新入社員3名の紹介を掲載しています。",
      terms: ["新入社員", "社員紹介", "藍沢", "峰岸", "星野", "検索語"]
    },
    {
      title: "Project:Meteor 関連資料",
      url: "meteor.html",
      excerpt: "Project:Meteorに関する社内確認用資料を掲載しています。",
      terms: ["Meteor", "meteor", "ミーティア", "Project:Meteor", "プロジェクトミーティア"]
    }
  ];

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const input = document.querySelector("[data-search-input]");
  const output = document.querySelector("[data-search-results]");
  const historyOutput = document.querySelector("[data-search-history]");
  const historyKey = "hachiboshiSearchHistory";

  if (input) {
    input.value = query;
  }

  if (!output) {
    return;
  }

  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    output.innerHTML = "<p>キーワードを入力して検索してください。</p>";
    renderHistory();
    return;
  }

  const hiddenMatched = hiddenTerms.some((term) => normalize(term) === normalizedQuery);
  let hitCount = 0;
  let resultHtml = "";

  if (hiddenMatched) {
    hitCount = 1;
    resultHtml = [
      "<p class=\"result-count\">1件見つかりました。</p>",
      "<a class=\"result-item\" href=\"archive-room.html\">",
      "<strong>資料閲覧室</strong>",
      "<span>標章確認に関する補足資料を表示します。</span>",
      "</a>"
    ].join("");
    output.innerHTML = resultHtml;
    saveHistory(query, hitCount);
    renderHistory();
    return;
  }

  const results = pages.filter((page) => {
    return page.terms.some((term) => normalize(term).includes(normalizedQuery));
  });

  if (!results.length) {
    output.innerHTML = "<p>該当する公開ページは見つかりませんでした。</p>";
    saveHistory(query, hitCount);
    renderHistory();
    return;
  }

  hitCount = results.length;
  resultHtml = [
    `<p class="result-count">${results.length}件見つかりました。</p>`,
    ...results.map((page) => {
      return [
        `<a class="result-item" href="${page.url}">`,
        `<strong>${page.title}</strong>`,
        `<span>${page.excerpt}</span>`,
        "</a>"
      ].join("");
    })
  ].join("");
  output.innerHTML = resultHtml;
  saveHistory(query, hitCount);
  renderHistory();

  function normalize(value) {
    return String(value).replace(/[　\s]+/g, " ").trim().toLowerCase();
  }

  function saveHistory(term, count) {
    const word = String(term).replace(/[　\s]+/g, " ").trim();
    if (!word) {
      return;
    }

    const normalizedWord = normalize(word);
    const history = readHistory().filter((item) => normalize(item.word) !== normalizedWord);
    history.unshift({
      word,
      count,
      searchedAt: Date.now()
    });
    writeHistory(history.slice(0, 8));
  }

  function renderHistory() {
    if (!historyOutput) {
      return;
    }

    const history = readHistory();
    if (!history.length) {
      historyOutput.innerHTML = [
        "<h2>検索履歴</h2>",
        "<p>検索履歴はまだありません。</p>"
      ].join("");
      return;
    }

    historyOutput.innerHTML = [
      "<h2>検索履歴</h2>",
      "<div class=\"search-history-list\">",
      ...history.map((item) => {
        const word = escapeHtml(item.word);
        const href = `search.html?q=${encodeURIComponent(item.word)}`;
        return [
          `<a class="search-history-item" href="${href}">`,
          `<span>${word}</span>`,
          `<strong>${Number(item.count) || 0}件</strong>`,
          "</a>"
        ].join("");
      }),
      "</div>"
    ].join("");
  }

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(historyKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.word) : [];
    } catch (error) {
      return [];
    }
  }

  function writeHistory(history) {
    try {
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      return;
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      };
      return entities[character] || character;
    });
  }
})();
