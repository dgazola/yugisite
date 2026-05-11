// ── Card list state ───────────────────────────────────
let selectedCardIndex = -1;   // index in editorData.cards (main cards only)

// ── Landing card selector ──────────────────────────────
function editorRefreshLandingSelect() {
  const landingSelect = document.getElementById('landingCardSelect');
  const currentValue = landingSelect.value;
  landingSelect.innerHTML = '<option value="">— None —</option>';
  window.editorData.cards.forEach(card => {
    const trans = card.translations['en'] || Object.values(card.translations)[0] || {};
    const label = `${trans.title || '(untitled)'}`;
    landingSelect.innerHTML += `<option value="${card.id}">${label}</option>`;
  });
  if (window.editorData.cards.find(c => c.id === currentValue)) {
    landingSelect.value = currentValue;
  } else if (window.editorData.settings.landingCardId) {
    landingSelect.value = window.editorData.settings.landingCardId;
  }
}

// ── Render the card list ───────────────────────────────
function editorRenderCardList() {
  const container = document.getElementById('cardListContainer');
  const cards = window.editorData.cards;
  container.innerHTML = '';

  if (cards.length === 0) {
    container.innerHTML = `<div style="padding:20px;color:#5c5430;">No main cards yet.</div>`;
    document.getElementById('cardEditContainer').innerHTML = '';
    return;
  }

  cards.forEach((card, idx) => {
    const trans = card.translations['en'] || Object.values(card.translations)[0] || {};
    const title = trans.title || '(untitled)';
    const color = card.color || '';

    const item = document.createElement('div');
    item.className = 'list-item';
    if (idx === selectedCardIndex) item.classList.add('selected');
    item.innerHTML = `
      <div class="list-item-color" style="background:${color || 'transparent'};"></div>
      <div class="list-item-title">${editorEscapeHtml(title)}</div>
      <div class="list-item-actions">
        <button class="move-up-btn" title="Move Up">▲</button>
        <button class="move-down-btn" title="Move Down">▼</button>
        <button class="remove-btn" title="Remove">✕</button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      selectedCardIndex = idx;
      editorRenderCardList();
      editorRenderSelectedCard();
    });

    item.querySelector('.move-up-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editorMoveCard(card.id, -1);
    });
    item.querySelector('.move-down-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editorMoveCard(card.id, 1);
    });
    item.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editorRemoveCard(card.id);
    });

    container.appendChild(item);
  });

  if (selectedCardIndex < 0 || selectedCardIndex >= cards.length) {
    selectedCardIndex = 0;
    if (cards.length > 0) {
      const items = container.querySelectorAll('.list-item');
      items[0]?.classList.add('selected');
    }
  }

  editorRenderSelectedCard();
}

// ── Render the selected card editor ────────────────────
function editorRenderSelectedCard() {
  const container = document.getElementById('cardEditContainer');
  const card = window.editorData.cards[selectedCardIndex];
  if (!card) {
    container.innerHTML = '<div style="padding:20px;color:#5c5430;">No card selected.</div>';
    return;
  }

  const secondLang = window.editorState.secondLang || 'en';

  // ensure English translation exists
  if (!card.translations) card.translations = {};
  if (!card.translations['en']) card.translations['en'] = {};
  if (!card.translations[secondLang]) card.translations[secondLang] = {};

  const el = document.createElement('div');
  el.className = 'card-editor';
  el.innerHTML = `
    <div class="card-editor-header">
      <h4>Editing card <span style="font-size:0.7rem;color:var(--editor-muted)">${card.id}</span></h4>
    </div>
    <div class="form-group" style="margin-bottom:8px;">
      <label>UI Mode</label>
      <select class="field-uimode" style="padding:6px;">
        <option value="opaque" ${card.uiMode === 'opaque' ? 'selected' : ''}>Opaque</option>
        <option value="transparent" ${card.uiMode === 'transparent' ? 'selected' : ''}>Transparent</option>
      </select>
    </div>
    <div class="form-group" style="margin-bottom:8px;">
      <label>Image URL</label>
      <input type="text" class="field-imageurl" value="${editorEscapeHtml(card.imageUrl || '')}" />
    </div>
    <div class="form-group" style="margin-bottom:8px;">
      <label>WebM Video URL</label>
      <input type="text" class="field-videourl" value="${editorEscapeHtml(card.videoUrl || '')}" />
    </div>
    <div class="form-group" style="margin-bottom:8px;">
      <label>Link URL <span style="font-weight:normal;font-size:0.7rem;">(shared across languages)</span></label>
      <input type="text" class="field-link" value="${editorEscapeHtml(card.link || '')}" />
    </div>
    <div class="form-group" style="margin-bottom:8px;">
      <label>Card Colour <span style="font-weight:normal;font-size:0.7rem;">(optional)</span></label>
      <input type="color" class="field-color" value="${card.color || ''}" />
    </div>
    <div class="card-editor-grid">
      ${ generateMultiLangField('Title', 'title', card, secondLang).outerHTML }
      ${ generateMultiLangField('Description', 'description', card, secondLang, true).outerHTML }
      ${ generateMultiLangField('Name', 'name', card, secondLang).outerHTML }
      ${ generateMultiLangField('Subtitle', 'sub', card, secondLang).outerHTML }
      ${ generateMultiLangField('Tag', 'tag', card, secondLang).outerHTML }
    </div>
  `;

  // Shared fields
  el.querySelector('.field-uimode').addEventListener('change', (e) => { card.uiMode = e.target.value; });
  el.querySelector('.field-imageurl').addEventListener('input', (e) => { card.imageUrl = e.target.value; });
  el.querySelector('.field-videourl').addEventListener('input', (e) => { card.videoUrl = e.target.value; });
  el.querySelector('.field-link').addEventListener('input', (e) => { card.link = e.target.value; });
  el.querySelector('.field-color').addEventListener('input', (e) => { card.color = e.target.value || null; });

  // Multi‑lang fields
  const multiLangGroups = el.querySelectorAll('.multi-lang-group');
  multiLangGroups.forEach(group => {
    const field = group.dataset.field;
    const inputs = group.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const lang = input.dataset.lang;
        if (!card.translations[lang]) card.translations[lang] = {};
        card.translations[lang][field] = input.value;
      });
    });
  });

  container.innerHTML = '';
  container.appendChild(el);
}

// ── GenerateMultiLangField – only EN + secondLang ──────
function generateMultiLangField(labelText, fieldKey, card, secondLang, isTextarea = false) {
  const container = document.createElement('div');
  container.className = 'form-group full-width multi-lang-group';
  container.dataset.field = fieldKey;
  container.innerHTML = `<label>${labelText}</label>`;
  const inputsContainer = document.createElement('div');
  inputsContainer.className = 'multi-lang-inputs';

  // English (always)
  const enVal = (card.translations['en'] && card.translations['en'][fieldKey]) || '';
  inputsContainer.innerHTML += `
    <div class="lang-input">
      <span class="lang-badge">EN</span>
      ${isTextarea
        ? `<textarea data-lang="en" rows="2">${editorEscapeHtml(enVal)}</textarea>`
        : `<input type="text" data-lang="en" value="${editorEscapeHtml(enVal)}" />`
      }
    </div>`;

  // Second language
  const secVal = (card.translations[secondLang] && card.translations[secondLang][fieldKey]) || '';
  inputsContainer.innerHTML += `
    <div class="lang-input">
      <span class="lang-badge">${secondLang.toUpperCase()}</span>
      ${isTextarea
        ? `<textarea data-lang="${secondLang}" rows="2">${editorEscapeHtml(secVal)}</textarea>`
        : `<input type="text" data-lang="${secondLang}" value="${editorEscapeHtml(secVal)}" />`
      }
    </div>`;

  container.appendChild(inputsContainer);
  return container;
}

// ── Add / Remove / Move ──────────────────────────────
function editorAddCard() {
  const langs = editorGetLanguages();
  const newCard = {
    column: 'main',
    order: window.editorData.cards.length,
    type: 'main',
    id: editorGenerateId(),
    uiMode: 'opaque',
    imageUrl: null,
    videoUrl: null,
    link: "",
    color: null,
    translations: {}
  };
  langs.forEach(lang => {
    newCard.translations[lang] = {
      name: "", sub: "", label: "", title: "New Main Card", description: "",
      meta: "", tag: ""
    };
  });
  window.editorData.cards.push(newCard);
  editorReorderAll();
  selectedCardIndex = window.editorData.cards.length - 1;
  editorRenderCardList();
  editorRefreshLandingSelect();
}

function editorRemoveCard(id) {
  if (!confirm('Remove this card?')) return;
  window.editorData.cards = window.editorData.cards.filter(c => c.id !== id);
  editorReorderAll();
  if (selectedCardIndex >= window.editorData.cards.length) {
    selectedCardIndex = Math.max(0, window.editorData.cards.length - 1);
  }
  editorRenderCardList();
  editorRefreshLandingSelect();
  if (window.editorData.settings.landingCardId === id) {
    window.editorData.settings.landingCardId = "";
    document.getElementById('landingCardSelect').value = "";
  }
}

function editorMoveCard(id, direction) {
  const cards = window.editorData.cards;
  const idx = cards.findIndex(c => c.id === id);
  if (idx < 0) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= cards.length) return;
  [cards[idx], cards[swapIdx]] = [cards[swapIdx], cards[idx]];
  if (selectedCardIndex === idx) selectedCardIndex = swapIdx;
  else if (selectedCardIndex === swapIdx) selectedCardIndex = idx;
  editorReorderAll();
  editorRenderCardList();
}