// Card list rendering and manipulation

function editorRefreshLandingSelect() {
  const landingSelect = document.getElementById('landingCardSelect');
  const currentValue = landingSelect.value;
  landingSelect.innerHTML = '<option value="">— None —</option>';
  window.editorData.cards.forEach(card => {
    const trans = card.translations && card.translations[window.editorState.currentLang]
                  ? card.translations[window.editorState.currentLang]
                  : (card.translations && card.translations[window.editorData.settings.defaultLanguage]
                    ? card.translations[window.editorData.settings.defaultLanguage] : {title:''});
    const label = `${card.column}: ${trans.title || '(untitled)'}`;
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
  const cards = window.editorData.cards.filter(c => c.column === window.editorState.currentColumn);
  cardList.innerHTML = '';
  if (cards.length === 0) {
    cardList.innerHTML = `<div style="text-align:center; padding:40px; color:#5c5430;">No cards in this column. Click "+ Add Card" to create one.</div>`;
    return;
  }
  cards.forEach((card, idx) => {
    card.translations = editorEnsureTranslations(card.translations, window.editorData.settings.languages);
    const t = card.translations[window.editorState.currentLang] || card.translations[window.editorData.settings.defaultLanguage] || {};
    const el = document.createElement('div');
    el.className = 'card-editor';
    el.setAttribute('data-card-id', card.id);
    el.innerHTML = `
      <div class="card-editor-header">
        <h4>Card #${idx+1} <span style="font-size:0.7rem;color:var(--editor-muted)">(${window.editorState.currentLang.toUpperCase()})</span></h4>
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
      <div class="card-editor-grid">
        <div class="form-group full-width"><label>Title</label><input type="text" class="field-title" value="${editorEscapeHtml(t.title||'')}"></div>
        <div class="form-group full-width"><label>Description</label><textarea class="field-desc" rows="3">${editorEscapeHtml(t.description||'')}</textarea></div>
        ${card.column === 'main' ? `
          <div class="form-group"><label>Name</label><input type="text" class="field-name" value="${editorEscapeHtml(t.name||'')}"></div>
          <div class="form-group"><label>Subtitle</label><input type="text" class="field-sub" value="${editorEscapeHtml(t.sub||'')}"></div>
          <div class="form-group full-width"><label>Tag</label><input type="text" class="field-tag" value="${editorEscapeHtml(t.tag||'')}"></div>
        ` : `
          <div class="form-group"><label>Label</label><input type="text" class="field-label" value="${editorEscapeHtml(t.label||'')}"></div>
          <div class="form-group"><label>Meta</label><input type="text" class="field-meta" value="${editorEscapeHtml(t.meta||'')}"></div>
        `}
      </div>`;

    el.querySelector('.remove-card').addEventListener('click', () => editorRemoveCard(card.id));
    el.querySelector('.move-up').addEventListener('click', () => editorMoveCard(card.id, -1));
    el.querySelector('.move-down').addEventListener('click', () => editorMoveCard(card.id, 1));
    el.querySelector('.field-uimode').addEventListener('change', (e) => { card.uiMode = e.target.value; });
    el.querySelector('.field-imageurl').addEventListener('input', (e) => { card.imageUrl = e.target.value; });
    el.querySelector('.field-videourl').addEventListener('input', (e) => { card.videoUrl = e.target.value; });

    const sync = (field, value) => { card.translations[window.editorState.currentLang][field] = value; editorRefreshLandingSelect(); };
    el.querySelector('.field-title').addEventListener('input', e => sync('title', e.target.value));
    el.querySelector('.field-desc').addEventListener('input', e => sync('description', e.target.value));
    if (card.column === 'main') {
      el.querySelector('.field-name').addEventListener('input', e => sync('name', e.target.value));
      el.querySelector('.field-sub').addEventListener('input', e => sync('sub', e.target.value));
      el.querySelector('.field-tag').addEventListener('input', e => sync('tag', e.target.value));
    } else {
      el.querySelector('.field-label').addEventListener('input', e => sync('label', e.target.value));
      el.querySelector('.field-meta').addEventListener('input', e => sync('meta', e.target.value));
    }
    cardList.appendChild(el);
  });
}

function editorAddCard() {
  const newCard = {
    column: window.editorState.currentColumn,
    order: window.editorData.cards.filter(c => c.column === window.editorState.currentColumn).length,
    type: window.editorState.currentColumn,
    id: editorGenerateId(),
    uiMode: 'opaque',
    imageUrl: null,
    videoUrl: null,
    translations: {}
  };
  window.editorData.settings.languages.forEach(lang => {
    newCard.translations[lang] = { name:"", sub:"", label:"", title:"New Card", description:"", meta:"", tag:"" };
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
  const colCards = window.editorData.cards.filter(c => c.column === window.editorState.currentColumn);
  const idx = colCards.findIndex(c => c.id === id);
  if (idx < 0) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= colCards.length) return;
  const globalA = window.editorData.cards.indexOf(colCards[idx]);
  const globalB = window.editorData.cards.indexOf(colCards[swapIdx]);
  [window.editorData.cards[globalA], window.editorData.cards[globalB]] =
    [window.editorData.cards[globalB], window.editorData.cards[globalA]];
  editorReorderAll();
  editorRenderCardList();
}
