function editorRefreshLandingSelect() {
  const landingSelect = document.getElementById('landingCardSelect');
  const currentValue = landingSelect.value;
  landingSelect.innerHTML = '<option value="">— None —</option>';
  window.editorData.cards.forEach(card => {
    // For the dropdown we show the English title (or first language)
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

function editorRenderCardList() {
  const cardList = document.getElementById('cardList');
  const cards = window.editorData.cards.filter(c => c.column === 'main');
  const langs = editorGetLanguages();
  cardList.innerHTML = '';
  if (cards.length === 0) {
    cardList.innerHTML = `<div style="text-align:center; padding:40px; color:#5c5430;">No main cards. Click "+ Add Main Card" to create one.</div>`;
    return;
  }
  cards.forEach((card, idx) => {
    // ensure translations exist for each language
    langs.forEach(lang => {
      if (!card.translations) card.translations = {};
      if (!card.translations[lang]) card.translations[lang] = {};
    });

    const el = document.createElement('div');
    el.className = 'card-editor';
    el.setAttribute('data-card-id', card.id);
    el.innerHTML = `
      <div class="card-editor-header">
        <h4>Main Card #${idx+1}</h4>
        <span class="card-id">${card.id}</span>
        <div style="display:flex; gap:4px;">
          <button class="btn-icon move-up" title="Move Up">▲</button>
          <button class="btn-icon move-down" title="Move Down">▼</button>
          <button class="btn-icon remove-card" title="Remove">✕</button>
        </div>
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
      <div class="card-editor-grid">
        ${ generateMultiLangField('Title', 'title', card, langs).outerHTML }
        ${ generateMultiLangField('Description', 'description', card, langs, true).outerHTML }
        ${ generateMultiLangField('Name', 'name', card, langs).outerHTML }
        ${ generateMultiLangField('Subtitle', 'sub', card, langs).outerHTML }
        ${ generateMultiLangField('Tag', 'tag', card, langs).outerHTML }
      </div>`;

    // event listeners for shared fields
    el.querySelector('.field-uimode').addEventListener('change', (e) => { card.uiMode = e.target.value; });
    el.querySelector('.field-imageurl').addEventListener('input', (e) => { card.imageUrl = e.target.value; });
    el.querySelector('.field-videourl').addEventListener('input', (e) => { card.videoUrl = e.target.value; });
    el.querySelector('.field-link').addEventListener('input', (e) => { card.link = e.target.value; });

    // multi‑lang field listeners attached via the generated elements
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

    // move / remove
    el.querySelector('.remove-card').addEventListener('click', () => editorRemoveCard(card.id));
    el.querySelector('.move-up').addEventListener('click', () => editorMoveCard(card.id, -1));
    el.querySelector('.move-down').addEventListener('click', () => editorMoveCard(card.id, 1));

    cardList.appendChild(el);
  });
}

// Helper to create a field group with one input per language
function generateMultiLangField(labelText, fieldKey, card, langs, isTextarea = false) {
  const container = document.createElement('div');
  container.className = 'form-group full-width multi-lang-group';
  container.dataset.field = fieldKey;
  container.innerHTML = `<label>${labelText}</label>`;
  const inputsContainer = document.createElement('div');
  inputsContainer.className = 'multi-lang-inputs';
  langs.forEach(lang => {
    const val = (card.translations[lang] && card.translations[lang][fieldKey]) || '';
    if (isTextarea) {
      inputsContainer.innerHTML += `
        <div class="lang-input">
          <span class="lang-badge">${lang.toUpperCase()}</span>
          <textarea data-lang="${lang}" rows="2">${editorEscapeHtml(val)}</textarea>
        </div>`;
    } else {
      inputsContainer.innerHTML += `
        <div class="lang-input">
          <span class="lang-badge">${lang.toUpperCase()}</span>
          <input type="text" data-lang="${lang}" value="${editorEscapeHtml(val)}" />
        </div>`;
    }
  });
  container.appendChild(inputsContainer);
  return container;
}

function editorAddCard() {
  const langs = editorGetLanguages();
  const newCard = {
    column: 'main',
    order: window.editorData.cards.filter(c => c.column === 'main').length,
    type: 'main',
    id: editorGenerateId(),
    uiMode: 'opaque',
    imageUrl: null,
    videoUrl: null,
    link: "",
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
  editorRenderCardList();
  editorRefreshLandingSelect();
}

function editorRemoveCard(id) {
  if (!confirm('Remove this card?')) return;
  window.editorData.cards = window.editorData.cards.filter(c => c.id !== id);
  editorReorderAll();
  editorRenderCardList();
  editorRefreshLandingSelect();
  if (window.editorData.settings.landingCardId === id) {
    window.editorData.settings.landingCardId = "";
    document.getElementById('landingCardSelect').value = "";
  }
}

function editorMoveCard(id, direction) {
  const cards = window.editorData.cards.filter(c => c.column === 'main');
  const idx = cards.findIndex(c => c.id === id);
  if (idx < 0) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= cards.length) return;
  const globalA = window.editorData.cards.indexOf(cards[idx]);
  const globalB = window.editorData.cards.indexOf(cards[swapIdx]);
  [window.editorData.cards[globalA], window.editorData.cards[globalB]] =
    [window.editorData.cards[globalB], window.editorData.cards[globalA]];
  editorReorderAll();
  editorRenderCardList();
}