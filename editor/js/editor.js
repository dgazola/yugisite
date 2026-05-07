(function() {
  let data = {
    settings: { landingCardId: "", defaultLanguage: "en", languages: ["en"] },
    cards: []
  };
  let currentColumn = "main";
  let currentLang = "en";

  const columnTabs = document.getElementById('columnTabs');
  const langTabs = document.getElementById('langTabs');
  const landingSelect = document.getElementById('landingCardSelect');
  const cardList = document.getElementById('cardList');
  const addCardBtn = document.getElementById('addCardBtn');
  const loadBtn = document.getElementById('loadBtn');
  const saveBtn = document.getElementById('saveBtn');

  function generateId() {
    return 'card-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
  }

  // ── Language tabs ─────────────────────────────────────
  function renderLangTabs() {
    const langs = data.settings.languages || ["en"];
    if (!langs.includes("en")) langs.unshift("en");
    data.settings.languages = langs; // ensure consistency

    langTabs.innerHTML = '<span style="font-size:0.7rem;text-transform:uppercase;color:var(--editor-muted)">Language</span>';
    langs.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'tab lang-tab' + (lang === currentLang ? ' active' : '');
      btn.textContent = lang.toUpperCase();
      btn.addEventListener('click', () => {
        currentLang = lang;
        renderLangTabs();
        renderCardList();
      });
      langTabs.appendChild(btn);
    });
  }

  // ── Landing card dropdown ─────────────────────────────
  function refreshLandingSelect() {
    const currentValue = landingSelect.value;
    landingSelect.innerHTML = '<option value="">— None —</option>';
    data.cards.forEach(card => {
      const trans = card.translations && card.translations[currentLang] ? card.translations[currentLang]
                    : (card.translations && card.translations[data.settings.defaultLanguage] ? card.translations[data.settings.defaultLanguage] : null);
      const title = trans?.title || '(untitled)';
      const label = `${card.column}: ${title}`;
      landingSelect.innerHTML += `<option value="${card.id}">${label}</option>`;
    });
    if (data.cards.find(c => c.id === currentValue)) {
      landingSelect.value = currentValue;
    } else if (data.settings.landingCardId) {
      landingSelect.value = data.settings.landingCardId;
    }
  }

  landingSelect.addEventListener('change', () => {
    data.settings.landingCardId = landingSelect.value;
  });

  // ── Render card list ──────────────────────────────────
  function getColumnCards() {
    return data.cards.filter(c => c.column === currentColumn);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderCardList() {
    const cards = getColumnCards();
    cardList.innerHTML = '';

    if (cards.length === 0) {
      cardList.innerHTML = `<div style="text-align:center; padding:40px; color:#5c5430;">No cards in this column. Click "+ Add Card" to create one.</div>`;
      return;
    }

    cards.forEach((card, idx) => {
      const trans = card.translations && card.translations[currentLang] ? card.translations[currentLang]
                    : (card.translations && card.translations[data.settings.defaultLanguage] ? card.translations[data.settings.defaultLanguage] : {});
      // ensure translation exists
      if (!card.translations) card.translations = {};
      if (!card.translations[currentLang]) {
        card.translations[currentLang] = {
          name: "", sub: "", label: "", title: "", description: "", meta: "", tag: ""
        };
      }
      const t = card.translations[currentLang];

      const el = document.createElement('div');
      el.className = 'card-editor';
      el.setAttribute('data-card-id', card.id);
      el.innerHTML = `
        <div class="card-editor-header">
          <h4>Card #${idx + 1} <span style="font-size:0.7rem;color:var(--editor-muted)">(${currentLang.toUpperCase()})</span></h4>
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
            <input type="text" class="field-title" value="${escapeHtml(t.title)}" />
          </div>
          <div class="form-group full-width">
            <label>Description</label>
            <textarea class="field-desc" rows="3">${escapeHtml(t.description)}</textarea>
          </div>
          ${card.column === 'main' ? `
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="field-name" value="${escapeHtml(t.name)}" />
            </div>
            <div class="form-group">
              <label>Subtitle</label>
              <input type="text" class="field-sub" value="${escapeHtml(t.sub)}" />
            </div>
            <div class="form-group full-width">
              <label>Tag</label>
              <input type="text" class="field-tag" value="${escapeHtml(t.tag)}" />
            </div>
          ` : `
            <div class="form-group">
              <label>Label</label>
              <input type="text" class="field-label" value="${escapeHtml(t.label)}" />
            </div>
            <div class="form-group">
              <label>Meta</label>
              <input type="text" class="field-meta" value="${escapeHtml(t.meta)}" />
            </div>
          `}
        </div>
      `;

      // Event listeners
      el.querySelector('.remove-card').addEventListener('click', () => removeCard(card.id));
      el.querySelector('.move-up').addEventListener('click', () => moveCard(card.id, -1));
      el.querySelector('.move-down').addEventListener('click', () => moveCard(card.id, 1));

      // Sync inputs to translations
      const sync = (field, value) => { card.translations[currentLang][field] = value; refreshLandingSelect(); };
      el.querySelector('.field-title').addEventListener('input', (e) => sync('title', e.target.value));
      el.querySelector('.field-desc').addEventListener('input', (e) => sync('description', e.target.value));
      if (card.column === 'main') {
        el.querySelector('.field-name').addEventListener('input', (e) => sync('name', e.target.value));
        el.querySelector('.field-sub').addEventListener('input', (e) => sync('sub', e.target.value));
        el.querySelector('.field-tag').addEventListener('input', (e) => sync('tag', e.target.value));
      } else {
        el.querySelector('.field-label').addEventListener('input', (e) => sync('label', e.target.value));
        el.querySelector('.field-meta').addEventListener('input', (e) => sync('meta', e.target.value));
      }

      cardList.appendChild(el);
    });
  }

  // ── Card operations ───────────────────────────────────
  function addCard() {
    const newCard = {
      column: currentColumn,
      order: getColumnCards().length,
      type: currentColumn,
      id: generateId(),
      translations: {}
    };
    // create empty translations for all languages
    (data.settings.languages || ["en"]).forEach(lang => {
      newCard.translations[lang] = {
        name: "", sub: "", label: "", title: "New Card", description: "", meta: "", tag: ""
      };
    });
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
    if (!tab || tab.classList.contains('lang-tab')) return;
    columnTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentColumn = tab.getAttribute('data-column');
    renderCardList();
    refreshLandingSelect();
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
            // old format
            data = {
              settings: { landingCardId: "", defaultLanguage: "en", languages: ["en"] },
              cards: json.map(c => migrateOldCard(c))
            };
          } else if (json && Array.isArray(json.cards)) {
            data = json;
            if (!data.settings) data.settings = { landingCardId: "", defaultLanguage: "en", languages: ["en"] };
            if (!data.settings.languages) data.settings.languages = ["en"];
            // ensure translations
            data.cards.forEach(c => {
              if (!c.translations) c.translations = {};
              (data.settings.languages).forEach(lang => {
                if (!c.translations[lang]) c.translations[lang] = {
                  name: "", sub: "", label: "", title: c.title || "", description: c.description || "", meta: "", tag: ""
                };
              });
            });
          } else {
            alert('Invalid JSON structure.');
            return;
          }
          currentLang = data.settings.defaultLanguage || 'en';
          reorderAll();
          renderLangTabs();
          renderCardList();
          refreshLandingSelect();
          if (data.settings.landingCardId) landingSelect.value = data.settings.landingCardId;
        } catch (err) { alert('Failed to parse JSON: ' + err.message); }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  function migrateOldCard(c) {
    return {
      column: c.column || "main",
      order: c.order || 0,
      type: c.type || c.column,
      id: c.id || generateId(),
      translations: {
        en: {
          name: c.name || "",
          sub: c.sub || "",
          label: c.label || "",
          title: c.title || "",
          description: c.description || "",
          meta: c.meta || "",
          tag: c.tag || ""
        }
      }
    };
  }

  function reorderAll() {
    reorderColumn('main');
    reorderColumn('devlog');
    reorderColumn('blog');
  }

  // ── Save / Download ───────────────────────────────────
  saveBtn.addEventListener('click', () => {
    reorderAll();
    // ensure all ids
    data.cards.forEach(c => { if (!c.id) c.id = generateId(); });
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
  });

  // ── Auto‑load from server ─────────────────────────────
  async function autoLoad() {
    try {
      const resp = await fetch('../mainpagecards.json');
      if (!resp.ok) throw new Error('Not found');
      const json = await resp.json();
      if (Array.isArray(json)) {
        data = {
          settings: { landingCardId: "", defaultLanguage: "en", languages: ["en"] },
          cards: json.map(c => migrateOldCard(c))
        };
      } else if (json && Array.isArray(json.cards)) {
        data = json;
        if (!data.settings) data.settings = { landingCardId: "", defaultLanguage: "en", languages: ["en"] };
        if (!data.settings.languages) data.settings.languages = ["en"];
        data.cards.forEach(c => {
          if (!c.translations) c.translations = {};
          data.settings.languages.forEach(lang => {
            if (!c.translations[lang]) c.translations[lang] = {
              name: "", sub: "", label: "", title: "", description: "", meta: "", tag: ""
            };
          });
        });
      }
      currentLang = data.settings.defaultLanguage || 'en';
      reorderAll();
      renderLangTabs();
      renderCardList();
      refreshLandingSelect();
      if (data.settings.landingCardId) landingSelect.value = data.settings.landingCardId;
    } catch {
      console.log('No JSON found on server. Starting fresh.');
      renderLangTabs();
      renderCardList();
    }
  }

  autoLoad();
})();
