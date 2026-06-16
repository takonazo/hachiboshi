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
      title: "社内報「星だより」第38号",
      url: "newsletter.html",
      excerpt: "社内報、社内報コンテスト、品質保証室からのお知らせを掲載しています。",
      terms: ["社内報", "星だより", "社内報コンテスト", "品質保証", "標章確認"]
    },
    {
      title: "新入社員紹介特設ページ",
      url: "new-employees.html",
      excerpt: "2026年度の新入社員3名の紹介を掲載しています。",
      terms: ["新入社員", "社員紹介", "藍沢", "峰岸", "星野", "検索語"]
    }
  ];

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const input = document.querySelector("[data-search-input]");
  const output = document.querySelector("[data-search-results]");

  if (input) {
    input.value = query;
  }

  if (!output) {
    return;
  }

  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    output.innerHTML = "<p>キーワードを入力して検索してください。</p>";
    return;
  }

  const hiddenMatched = hiddenTerms.some((term) => normalize(term) === normalizedQuery);
  if (hiddenMatched) {
    output.innerHTML = [
      "<p class=\"result-count\">1件見つかりました。</p>",
      "<a class=\"result-item\" href=\"archive-room.html\">",
      "<strong>資料閲覧室</strong>",
      "<span>標章確認に関する補足資料を表示します。</span>",
      "</a>"
    ].join("");
    return;
  }

  const results = pages.filter((page) => {
    return page.terms.some((term) => normalize(term).includes(normalizedQuery));
  });

  if (!results.length) {
    output.innerHTML = "<p>該当する公開ページは見つかりませんでした。</p>";
    return;
  }

  output.innerHTML = [
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

  function normalize(value) {
    return value.replace(/[　\s]+/g, " ").trim().toLowerCase();
  }
})();
