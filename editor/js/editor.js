// ── In-browser Card Editor ─────────────────────────────
// Reads mainpagecards.json, edits it visually, exports the modified file.

(function() {
  // ── State ─────────────────────────────────────────────
  let data = {
    settings: { landingCardId: "" },
    cards: []
  };
  let currentColumn = "main";

  // ── DOM refs ──────────────────────────────────────────
  const columnTabs = document.getElementById('columnTabs');
  const landingSelect = document.getElementById('landingCardSelect');
  const cardList = document.getElementById('cardList');
  const addCardBtn = document.getElementById('addCardBtn');
  const loadBtn = document.getElementById('loadBtn');
  const saveBtn = document.getElementById('saveBtn');

  // ── Unique ID generator ───────────────────────────────
  function generateId() {
    return 'card-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
  }

  // ── Landing card dropdown ─────────────────────────────
  function refreshLandingSelect() {
    const currentValue = landingSelect.value;
    landingSelect.innerHTML = '<option value="">— None —</option>';
    data.cards.forEach(card => {
      const label = `${card.column}: ${card.title || '(untitled)'}`;
      landingSelect.innerHTML += `<option value="${card.id}">${label}</option>`;
    });
    // restore previous selection
    if (data.cards.find(c => c.id === currentValue)) {
      landingSelect.value = currentValue;
    } else if (data.settings.landingCardId) {
      landingSelect.value = data.settings.landingCardId;
    }
  }

  landingSelect.addEventListener('change', () => {
    data.settings.landingCardId = landingSelect.value;
  });

  // ── Render card list for current column ──────────────
  function getColumnCards() {
    return data.cards.filter(c => c.column === currentColumn);
  }

  function renderCardList() {
    const cards = getColumnCards();
    cardList.innerHTML = '';

    if (cards.length === 0) {
      cardList.innerHTML = `
        <div style="text-align:center; padding:40px; color:#5c5430;">
          No cards in this column. Click "+ Add Card" to create one.
        </div>`;
      return;
    }

    cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'card-editor';
      el.setAttribute('data-card-id', card.id);
      el.innerHTML = `
        <div class="card-editor-header">
          <h4>Card #${idx + 1}</h4>
          <span class="card-id">${card.id}</span>
          <div style="display:flex; gap:4px;">
            <button class="btn-icon move-up" title="Move Up">▲</button>
            <button class="btn-icon move-down" title="Move Down">▼</button>
            <button class="btn-icon remove-card" title="Remove">✕</button>
          </div>
        </div>
        <div class="card-editor-grid">
          <div class="form-group full-width">
            <label>Title</label>
            <input type="text" class="field-title" value="${escapeHtml(card.title)}" />
          </div>
          <div class="form-group full-width">
            <label>Description</label>
            <textarea class="field-desc" rows="3">${escapeHtml(card.description)}</textarea>
          </div>
          ${card.column === 'main' ? `
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="field-name" value="${escapeHtml(card.name)}" />
            </div>
            <div class="form-group">
              <label>Subtitle</label>
              <input type="text" class="field-sub" value="${escapeHtml(card.sub)}" />
            </div>
            <div class="form-group full-width">
              <label>Tag</label>
              <input type="text" class="field-tag" value="${escapeHtml(card.tag)}" />
            </div>
          ` : `
            <div class="form-group">
              <label>Label</label>
              <input type="text" class="field-label" value="${escapeHtml(card.label)}" />
            </div>
            <div class="form-group">
              <label>Meta</label>
              <input type="text" class="field-meta" value="${escapeHtml(card.meta)}" />
            </div>
          `}
        </div>
      `;

      // Attach event listeners
      el.querySelector('.remove-card').addEventListener('click', () => removeCard(card.id));
      el.querySelector('.move-up').addEventListener('click', () => moveCard(card.id, -1));
      el.querySelector('.move-down').addEventListener('click', () => moveCard(card.id, 1));

      // Input change listeners
      el.querySelector('.field-title').addEventListener('input', (e) => {
        card.title = e.target.value;
        refreshLandingSelect();
      });
      el.querySelector('.field-desc').addEventListener('input', (e) => { card.description = e.target.value; });

      if (card.column === 'main') {
        el.querySelector('.field-name').addEventListener('input', (e) => { card.name = e.target.value; });
        el.querySelector('.field-sub').addEventListener('input', (e) => { card.sub = e.target.value; });
        el.querySelector('.field-tag').addEventListener('input', (e) => { card.tag = e.target.value; });
      } else {
        el.querySelector('.field-label').addEventListener('input', (e) => { card.label = e.target.value; });
        el.querySelector('.field-meta').addEventListener('input', (e) => { card.meta = e.target.value; });
        el.querySelector('.field-sub')?.addEventListener('input', (e) => { card.sub = e.target.value; });
      }

      cardList.appendChild(el);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Card operations ───────────────────────────────────
  function addCard() {
    const newCard = {
      column: currentColumn,
      order: getColumnCards().length,
      type: currentColumn,
      id: generateId(),
      name: "",
      sub: "",
      label: "",
      title: "New Card",
      description: "",
      meta: "",
      tag: ""
    };
    data.cards.push(newCard);
    reorderColumn(currentColumn);
    renderCardList();
    refreshLandingSelect();
  }

  function removeCard(id) {
    if (!confirm('Remove this card?')) return;
    data.cards = data.cards.filter(c => c.id !== id);
    reorderColumn(currentColumn);
    renderCardList();
    refreshLandingSelect();
    // If removed card was landing card, clear it
    if (data.settings.landingCardId === id) {
      data.settings.landingCardId = "";
      landingSelect.value = "";
    }
  }

  function moveCard(id, direction) {
    const colCards = data.cards.filter(c => c.column === currentColumn);
    const idx = colCards.findIndex(c => c.id === id);
    if (idx < 0) return;
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= colCards.length) return;

    const globalIdxA = data.cards.indexOf(colCards[idx]);
    const globalIdxB = data.cards.indexOf(colCards[swapIdx]);
    // swap
    [data.cards[globalIdxA], data.cards[globalIdxB]] = [data.cards[globalIdxB], data.cards[globalIdxA]];
    reorderColumn(currentColumn);
    renderCardList();
  }

  function reorderColumn(col) {
    let order = 0;
    data.cards.forEach(c => {
      if (c.column === col) c.order = order++;
    });
  }

  // ── Column switching ──────────────────────────────────
  columnTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    columnTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentColumn = tab.getAttribute('data-column');
    renderCardList();
  });

  addCardBtn.addEventListener('click', addCard);

  // ── Load JSON ─────────────────────────────────────────
  loadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target.result);
          if (Array.isArray(json)) {
            data = { settings: { landingCardId: "" }, cards: json };
          } else if (json && Array.isArray(json.cards)) {
            data = json;
            if (!data.settings) data.settings = { landingCardId: "" };
          } else {
            alert('Invalid JSON structure. Expected an array or { settings, cards }.');
            return;
          }
          // ensure each card has an id
          data.cards.forEach(c => { if (!c.id) c.id = generateId(); });
          reorderColumn('main');
          reorderColumn('devlog');
          reorderColumn('blog');
          renderCardList();
          refreshLandingSelect();
          if (data.settings.landingCardId) landingSelect.value = data.settings.landingCardId;
          console.log(`Loaded ${data.cards.length} cards.`);
        } catch (err) {
          alert('Failed to parse JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // ── Export / Download JSON ────────────────────────────
  saveBtn.addEventListener('click', () => {
    // Reorder all columns
    reorderColumn('main');
    reorderColumn('devlog');
    reorderColumn('blog');

    // Ensure all IDs are unique
    const ids = new Set();
    data.cards.forEach(c => {
      if (!c.id || ids.has(c.id)) c.id = generateId();
      ids.add(c.id);
      c.type = c.column;
    });

    // If landing card id doesn't match any card, clear it
    if (data.settings.landingCardId && !data.cards.find(c => c.id === data.settings.landingCardId)) {
      data.settings.landingCardId = "";
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mainpagecards.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log(`Exported ${data.cards.length} cards.`);
  });

  // ── Auto-load from server on page load ────────────────
  async function autoLoad() {
    try {
      const resp = await fetch('../mainpagecards.json');
      if (!resp.ok) throw new Error('Not found');
      const json = await resp.json();
      if (Array.isArray(json)) {
        data = { settings: { landingCardId: "" }, cards: json };
      } else if (json && Array.isArray(json.cards)) {
        data = json;
        if (!data.settings) data.settings = { landingCardId: "" };
      }
      data.cards.forEach(c => { if (!c.id) c.id = generateId(); });
      reorderColumn('main');
      reorderColumn('devlog');
      reorderColumn('blog');
      renderCardList();
      refreshLandingSelect();
      if (data.settings.landingCardId) landingSelect.value = data.settings.landingCardId;
      console.log(`Auto-loaded ${data.cards.length} cards from server.`);
    } catch {
      console.log('No existing JSON found on server. Starting fresh.');
      renderCardList();
    }
  }

  autoLoad();
})();
