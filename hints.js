document.addEventListener('DOMContentLoaded', () => {
  const csvPath = 'hints/ヒント一覧.csv';
  let hints = [];
  let currentIndex = 0;
  let revealedLevel = 0;

  // DOM Elements
  const bodyArea = document.getElementById('hint-body-area');
  const hintNoEl = document.getElementById('hint-no');
  const hintStatusEl = document.getElementById('hint-status');
  const hintTitleEl = document.getElementById('hint-title');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const counterEl = document.getElementById('nav-counter');

  // CSVをパースする関数
  function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const parsedData = [];
    
    // ヘッダー行を取得
    const headers = lines[0] ? lines[0].split(',') : [];
    if (headers.length === 0) return [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 簡易的なCSVパーサー（ダブルクォーテーションを考慮）
      const row = [];
      let insideQuote = false;
      let entry = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          row.push(entry.trim());
          entry = '';
        } else {
          entry += char;
        }
      }
      row.push(entry.trim());

      // データの整形
      // [ヒントNo, ヒント名, ヒント内容1, ヒント内容2, ヒント内容3, ヒント内容4]
      if (row.length >= 2) {
        const no = row[0];
        const title = row[1];
        const steps = [];
        
        // 3列目以降のヒント内容を取得し、空欄でなければ steps 配列に追加
        for (let k = 2; k < row.length; k++) {
          if (row[k]) {
            // 文字列内にエスケープされたダブルクォート等があれば直す
            let content = row[k].replace(/^"|"$/g, '').replace(/""/g, '"');
            if (content) {
              steps.push(content);
            }
          }
        }

        parsedData.push({
          no: no,
          title: title,
          steps: steps
        });
      }
    }
    return parsedData;
  }

  // データをロードする
  async function loadHints() {
    try {
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // UTF-8で読み込み
      const text = await response.text();
      hints = parseCSV(text);
      
      if (hints.length === 0) {
        showSystemMessage('DATABASE IS EMPTY');
        return;
      }
      
      // 初期描画
      renderHint();
    } catch (error) {
      console.error('Error loading hints:', error);
      showSystemMessage('ERROR: FAILED TO LOAD HINT DATABASE');
    }
  }

  // エラー/ロード中のシステムメッセージ表示
  function showSystemMessage(msg) {
    bodyArea.innerHTML = `<div class="system-message blink">${msg}</div>`;
    hintNoEl.textContent = 'HINT No. --';
    hintTitleEl.textContent = 'SYSTEM ERROR';
    hintStatusEl.textContent = 'ERROR';
    hintStatusEl.classList.add('locked');
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    counterEl.textContent = '-- / --';
  }

  // ヒントカードの描画
  function renderHint() {
    if (hints.length === 0) return;
    
    const currentHint = hints[currentIndex];
    
    // No と タイトルの更新
    // Noが数字単体の場合を考慮してフォーマットを整える（例: "1" -> "HINT No. 01"）
    const formattedNo = isNaN(currentHint.no) ? currentHint.no : `0${currentHint.no}`.slice(-2);
    hintNoEl.textContent = `HINT No. ${formattedNo}`;
    hintTitleEl.textContent = currentHint.title;
    
    // ナビゲーションの更新
    counterEl.textContent = `${currentIndex + 1} / ${hints.length}`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === hints.length - 1;

    // 表示内容の描画
    bodyArea.innerHTML = '';

    if (revealedLevel === 0) {
      // 未開示状態
      hintStatusEl.textContent = 'LOCKED';
      hintStatusEl.classList.add('locked');

      const placeholder = document.createElement('div');
      placeholder.className = 'hint-locked-placeholder';
      placeholder.innerHTML = `
        <p>ヒントを見るには、以下のボタンを押してください。</p>
        <button id="unlock-btn" class="btn-cyber">UNLOCK HINT</button>
      `;
      bodyArea.appendChild(placeholder);

      // イベントリスナー設定
      document.getElementById('unlock-btn').addEventListener('click', () => {
        revealedLevel = 1;
        renderHint();
      });
    } else {
      // 開示状態
      hintStatusEl.textContent = 'UNLOCKED';
      hintStatusEl.classList.remove('locked');

      const stepsList = document.createElement('div');
      stepsList.className = 'hint-steps-list';

      // 現在のレベルまでヒント内容を表示
      for (let i = 0; i < revealedLevel; i++) {
        if (currentHint.steps[i]) {
          const stepItem = document.createElement('div');
          stepItem.className = 'hint-step-item';
          stepItem.innerHTML = `
            <div class="hint-step-label">PHASE ${i + 1}</div>
            <div class="hint-step-content">${currentHint.steps[i]}</div>
          `;
          stepsList.appendChild(stepItem);
        }
      }
      bodyArea.appendChild(stepsList);

      // さらにヒントを見るボタンを表示するか（次の段階のヒントが存在するか）
      if (revealedLevel < currentHint.steps.length) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'btn-cyber btn-more-hint';
        moreBtn.textContent = 'さらにヒントを見る';
        moreBtn.addEventListener('click', () => {
          revealedLevel++;
          renderHint();
        });
        bodyArea.appendChild(moreBtn);
      }
    }
  }

  // ナビゲーションイベント
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      revealedLevel = 0; // ネタバレ防止のため未開示状態にリセット
      renderHint();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < hints.length - 1) {
      currentIndex++;
      revealedLevel = 0; // ネタバレ防止のため未開示状態にリセット
      renderHint();
    }
  });

  // キーボード操作での移動もサポート（アクセシビリティ・UX向上）
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      prevBtn.click();
    } else if (e.key === 'ArrowRight' && currentIndex < hints.length - 1) {
      nextBtn.click();
    }
  });

  // ロード開始
  loadHints();
});
