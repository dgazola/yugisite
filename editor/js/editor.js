(function() {
  let data = {
    settings: {
      landingCardId: "",
      defaultLanguage: "en",
      languages: ["en"],
      siteTitle: { "en": "Life Snake Studio" }
    },
    menu: [],
    cards: []
  };
  let currentColumn = "main";
  let currentLang = "en";
  let currentMainTab = "cards";

  const mainTabs = document.getElementById('mainTabs');
  const panelCards = document.getElementById('panelCards');
  const panelMenu = document.getElementById('panelMenu');
  const panelLanguages = document.getElementById('panelLanguages');
  const columnTabs = document.getElementById('columnTabs');
  const langTabsEl = document.getElementById('langTabs');
  const landingSelect = document.getElementById('landingCardSelect');
  const cardList = document.getElementById('cardList');
  const menuList = document.getElementById('menuList');
  const menuEditArea = document.getElementById('menuEditArea');
  const langList = document.getElementById('langList');
  const addCardBtn = document.getElementById('addCardBtn');
  const addMenuItemBtn = document.getElementById('addMenuItemBtn');
  const addLanguageBtn = document.getElementById('addLanguageBtn');
  const newLangCode = document.getElementById('newLangCode');
  const loadBtn = document.getElementById('loadBtn');
  const saveBtn = document.getElementById('saveBtn');

  function generateId() {
    return 'card-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
  }

  function ensureTranslations(obj, langs) {
    if (!obj) obj = {};
    langs.forEach(lang => {
      if (!obj[lang]) obj[lang] = (lang === 'en' ? '' : (obj['en'] || ''));
    });
    return obj;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getColumnCards() {
    return data.cards.filter(c => c.column === currentColumn);
  }

  function reorderAll() {
    ['main','devlog','blog'].forEach(col => {
      let order = 0;
      data.cards.forEach(c => { if (c.column === col) c.order = order++; });
    });
  }

  function renderLangTabs() {
    const langs = data.settings.languages || ["en"];
    if (!langs.includes("en")) langs.unshift("en");
    data.settings.languages = langs;

    langTabsEl.innerHTML = '<span style="font-size:0.7rem;text-transform:uppercase;color:var(--editor-muted);margin-right:8px;">Editing:</span>';
    langs.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'tab lang-tab' + (lang === currentLang ? ' active' : '');
      btn.textContent = lang.toUpperCase();
      btn.addEventListener('click', () => {
        currentLang = lang;
        renderLangTabs();
        if (currentMainTab === 'cards') renderCardList();
        else if (currentMainTab === 'menu') renderMenuEdit();
      });
      langTabsEl.appendChild(btn);
    });
  }

  function refreshLandingSelect() {
    const currentValue = landingSelect.value;
    landingSelect.innerHTML = '<option value="">— None —</option>';
    data.cards.forEach(card => {
      const trans = card.translations && card.translations[currentLang] ? card.translations[currentLang]
                    : (card.translations && card.translations[data.settings.defaultLanguage] ? card.translations[data.settings.defaultLanguage] : {title:''});
      const label = `${card.column}: ${trans.title || '(untitled)'}`;
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

  function renderCardList() {
    const cards = getColumnCards();
    cardList.innerHTML = '';
    if (cards.length === 0) {
      cardList.innerHTML = `<div style="text-align:center; padding:40px; color:#5c5430;">No cards in this column. Click "+ Add Card" to create one.</div>`;
      return;
    }
    cards.forEach((card, idx) => {
      card.translations = ensureTranslations(card.translations, data.settings.languages);
      const t = card.translations[currentLang] || card.translations[data.settings.defaultLanguage] || {};
      const el = document.createElement('div');
      el.className = 'card-editor';
      el.setAttribute('data-card-id', card.id);
      el.innerHTML = `
        <div class="card-editor-header">
          <h4>Card #${idx+1} <span style="font-size:0.7rem;color:var(--editor-muted)">(${currentLang.toUpperCase()})</span></h4>
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
          <input type="text" class="field-imageurl" value="${escapeHtml(card.imageUrl || '')}" />
        </div>
        <div class="form-group" style="margin-bottom:8px;">
          <label>Video URL</label>
          <input type="text" class="field-videourl" value="${escapeHtml(card.videoUrl || '')}" />
        </div>
        <div class="card-editor-grid">
          <div class="form-group full-width"><label>Title</label><input type="text" class="field-title" value="${escapeHtml(t.title||'')}"></div>
          <div class="form-group full-width"><label>Description</label><textarea class="field-desc" rows="3">${escapeHtml(t.description||'')}</textarea></div>
          ${card.column === 'main' ? `
            <div class="form-group"><label>Name</label><input type="text" class="field-name" value="${escapeHtml(t.name||'')}"></div>
            <div class="form-group"><label>Subtitle</label><input type="text" class="field-sub" value="${escapeHtml(t.sub||'')}"></div>
            <div class="form-group full-width"><label>Tag</label><input type="text" class="field-tag" value="${escapeHtml(t.tag||'')}"></div>
          ` : `
            <div class="form-group"><label>Label</label><input type="text" class="field-label" value="${escapeHtml(t.label||'')}"></div>
            <div class="form-group"><label>Meta</label><input type="text" class="field-meta" value="${escapeHtml(t.meta||'')}"></div>
          `}
        </div>`;

      el.querySelector('.remove-card').addEventListener('click', () => removeCard(card.id));
      el.querySelector('.move-up').addEventListener('click', () => moveCard(card.id, -1));
      el.querySelector('.move-down').addEventListener('click', () => moveCard(card.id, 1));
      el.querySelector('.field-uimode').addEventListener('change', (e) => { card.uiMode = e.target.value; });
      el.querySelector('.field-imageurl').addEventListener('input', (e) => { card.imageUrl = e.target.value; });
      el.querySelector('.field-videourl').addEventListener('input', (e) => { card.videoUrl = e.target.value; });

      const sync = (field, value) => { card.translations[currentLang][field] = value; refreshLandingSelect(); };
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

  function addCard() {
    const newCard = {
      column: currentColumn,
      order: getColumnCards().length,
      type: currentColumn,
      id: generateId(),
      uiMode: 'opaque',
      imageUrl: null,
      videoUrl: null,
      translations: {}
    };
    data.settings.languages.forEach(lang => {
      newCard.translations[lang] = { name:"", sub:"", label:"", title:"New Card", description:"", meta:"", tag:"" };
    });
    data.cards.push(newCard);
    reorderAll();
    renderCardList();
    refreshLandingSelect();
  }

  function removeCard(id) {
    if (!confirm('Remove this card?')) return;
    data.cards = data.cards.filter(c => c.id !== id);
    reorderAll();
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
    const globalA = data.cards.indexOf(colCards[idx]);
    const globalB = data.cards.indexOf(colCards[swapIdx]);
    [data.cards[globalA], data.cards[globalB]] = [data.cards[globalB], data.cards[globalA]];
    reorderAll();
    renderCardList();
  }

  addCardBtn.addEventListener('click', addCard);

  columnTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.col-tab');
    if (!tab) return;
    columnTabs.querySelectorAll('.col-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentColumn = tab.getAttribute('data-column');
    renderCardList();
    refreshLandingSelect();
  });

  function renderMenuEdit() {
    if (!data.menu) data.menu = [];
    data.menu.forEach(item => {
      item.translations = ensureTranslations(item.translations, data.settings.languages);
    });

    menuEditArea.style.display = 'block';
    cardList.style.display = 'none';
    menuEditArea.innerHTML = '';

    data.menu.forEach((item, idx) => {
      const label = item.translations[currentLang] || item.translations[data.settings.defaultLanguage] || item.id;
      const el = document.createElement('div');
      el.className = 'card-editor';
      el.innerHTML = `
        <div class="card-editor-header">
          <h4>Menu item #${idx+1}</h4>
          <span class="card-id">ID: ${item.id}</span>
          <div style="display:flex; gap:4px;">
            <button class="btn-icon move-up" title="Move Up">▲</button>
            <button class="btn-icon move-down" title="Move Down">▼</button>
            <button class="btn-icon remove-menu" title="Remove">✕</button>
          </div>
        </div>
        <div class="form-group">
          <label>Label (${currentLang})</label>
          <input type="text" class="menu-label" value="${escapeHtml(label)}">
        </div>`;
      el.querySelector('.remove-menu').addEventListener('click', () => {
        if (confirm('Remove this menu item?')) {
          data.menu.splice(idx, 1);
          renderMenuEdit();
          renderMenuList();
        }
      });
      el.querySelector('.move-up').addEventListener('click', () => {
        if (idx > 0) {
          [data.menu[idx], data.menu[idx-1]] = [data.menu[idx-1], data.menu[idx]];
          renderMenuEdit();
          renderMenuList();
        }
      });
      el.querySelector('.move-down').addEventListener('click', () => {
        if (idx < data.menu.length-1) {
          [data.menu[idx], data.menu[idx+1]] = [data.menu[idx+1], data.menu[idx]];
          renderMenuEdit();
          renderMenuList();
        }
      });
      el.querySelector('.menu-label').addEventListener('input', (e) => {
        item.translations[currentLang] = e.target.value;
        renderMenuList();
      });
      menuEditArea.appendChild(el);
    });

    if (data.menu.length === 0) {
      menuEditArea.innerHTML = '<p style="color:#5c5430;">No menu items yet. Add one.</p>';
    }
  }

  function renderMenuList() {
    menuList.innerHTML = '';
    (data.menu || []).forEach((item, idx) => {
      const label = item.translations[currentLang] || item.translations[data.settings.defaultLanguage] || item.id;
      const div = document.createElement('div');
      div.className = 'menu-editor-item';
      div.innerHTML = `<span>${idx+1}. ${label} (${item.id})</span>
        <button class="btn-icon remove-menu-item" data-idx="${idx}">✕</button>`;
      div.querySelector('.remove-menu-item').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Remove this menu item?')) {
          data.menu.splice(idx, 1);
          renderMenuList();
          renderMenuEdit();
        }
      });
      menuList.appendChild(div);
    });
  }

  addMenuItemBtn.addEventListener('click', () => {
    const id = prompt('Enter the card ID this menu item links to (e.g. home, world, tcg):');
    if (!id) return;
    if (data.menu.find(m => m.id === id)) {
      alert('Menu item with this ID already exists.');
      return;
    }
    const newItem = { id: id, translations: {} };
    data.settings.languages.forEach(lang => {
      newItem.translations[lang] = id;
    });
    data.menu.push(newItem);
    renderMenuList();
    renderMenuEdit();
  });

  function renderLanguageList() {
    langList.innerHTML = '';
    data.settings.languages.forEach(lang => {
      const div = document.createElement('div');
      div.className = 'lang-editor-item';
      div.innerHTML = `<span>${lang.toUpperCase()}</span>
        <button class="btn-icon remove-lang" data-lang="${lang}" ${lang === 'en' ? 'disabled title="Cannot remove default fallback"' : ''}>✕</button>`;
      div.querySelector('.remove-lang')?.addEventListener('click', (e) => {
        if (lang === 'en') return;
        if (confirm(`Remove language '${lang}'? This will delete all translations for that language.`)) {
          removeLanguage(lang);
        }
      });
      langList.appendChild(div);
    });
  }

  function removeLanguage(lang) {
    data.settings.languages = data.settings.languages.filter(l => l !== lang);
    data.cards.forEach(card => {
      if (card.translations) delete card.translations[lang];
    });
    data.menu.forEach(item => {
      if (item.translations) delete item.translations[lang];
    });
    if (currentLang === lang) currentLang = data.settings.defaultLanguage || 'en';
    renderLanguageList();
    renderLangTabs();
    if (currentMainTab === 'cards') renderCardList();
    else if (currentMainTab === 'menu') renderMenuEdit();
    renderMenuList();
    refreshLandingSelect();
  }

  addLanguageBtn.addEventListener('click', () => {
    const code = newLangCode.value.trim().toLowerCase();
    if (!code) return alert('Please enter a language code.');
    if (data.settings.languages.includes(code)) return alert('Language already exists.');
    data.settings.languages.push(code);
    data.cards.forEach(card => {
      if (!card.translations) card.translations = {};
      card.translations[code] = { name:"", sub:"", label:"", title:"", description:"", meta:"", tag:"" };
    });
    data.menu.forEach(item => {
      if (!item.translations) item.translations = {};
      item.translations[code] = item.translations[data.settings.defaultLanguage] || item.id;
    });
    newLangCode.value = '';
    renderLanguageList();
    renderLangTabs();
    if (currentMainTab === 'cards') renderCardList();
    else if (currentMainTab === 'menu') renderMenuEdit();
    renderMenuList();
    refreshLandingSelect();
  });

  mainTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.main-tab');
    if (!tab) return;
    const tabName = tab.getAttribute('data-tab');
    if (tabName === currentMainTab) return;
    currentMainTab = tabName;
    mainTabs.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    panelCards.style.display = tabName === 'cards' ? 'block' : 'none';
    panelMenu.style.display = tabName === 'menu' ? 'block' : 'none';
    panelLanguages.style.display = tabName === 'languages' ? 'block' : 'none';

    if (tabName === 'cards') {
      cardList.style.display = 'block';
      menuEditArea.style.display = 'none';
      renderCardList();
    } else if (tabName === 'menu') {
      cardList.style.display = 'none';
      menuEditArea.style.display = 'block';
      renderMenuList();
      renderMenuEdit();
    } else if (tabName === 'languages') {
      cardList.style.display = 'none';
      menuEditArea.style.display = 'none';
      renderLanguageList();
    }
  });

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
            data = {
              settings: { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } },
              menu: [],
              cards: json.map(c => migrateOldCard(c))
            };
          } else {
            data = json;
            if (!data.settings) data.settings = { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } };
            if (!data.settings.languages) data.settings.languages = ["en"];
            if (!data.menu) data.menu = [];
            data.cards.forEach(c => {
              if (!c.translations) c.translations = {};
              data.settings.languages.forEach(lang => {
                if (!c.translations[lang]) c.translations[lang] = { name:"", sub:"", label:"", title:c.title||"", description:c.description||"", meta:"", tag:"" };
              });
            });
            data.menu.forEach(item => {
              item.translations = ensureTranslations(item.translations, data.settings.languages);
            });
          }
          currentLang = data.settings.defaultLanguage || 'en';
          currentMainTab = 'cards';
          mainTabs.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
          mainTabs.querySelector('[data-tab="cards"]').classList.add('active');
          panelCards.style.display = 'block';
          panelMenu.style.display = 'none';
          panelLanguages.style.display = 'none';
          cardList.style.display = 'block';
          menuEditArea.style.display = 'none';
          reorderAll();
          renderLangTabs();
          renderCardList();
          renderMenuList();
          refreshLandingSelect();
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
      uiMode: c.uiMode || 'opaque',
      imageUrl: c.imageUrl || null,
      videoUrl: c.videoUrl || null,
      translations: {
        en: { name: c.name||"", sub: c.sub||"", label: c.label||"", title: c.title||"", description: c.description||"", meta: c.meta||"", tag: c.tag||"" }
      }
    };
  }

  saveBtn.addEventListener('click', () => {
    reorderAll();
    data.cards.forEach(c => { if (!c.id) c.id = generateId(); });
    if (data.settings.landingCardId && !data.cards.find(c => c.id === data.settings.landingCardId))
      data.settings.landingCardId = "";
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mainpagecards.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  async function autoLoad() {
    try {
      const resp = await fetch('../mainpagecards.json');
      if (!resp.ok) throw new Error('Not found');
      const json = await resp.json();
      if (Array.isArray(json)) {
        data = {
          settings: { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } },
          menu: [],
          cards: json.map(c => migrateOldCard(c))
        };
      } else {
        data = json;
        if (!data.settings) data.settings = { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } };
        if (!data.settings.languages) data.settings.languages = ["en"];
        if (!data.menu) data.menu = [];
        data.cards.forEach(c => {
          if (!c.translations) c.translations = {};
          data.settings.languages.forEach(lang => {
            if (!c.translations[lang]) c.translations[lang] = { name:"", sub:"", label:"", title:c.title||"", description:c.description||"", meta:"", tag:"" };
          });
        });
      }
      currentLang = data.settings.defaultLanguage || 'en';
      reorderAll();
      renderLangTabs();
      renderCardList();
      renderMenuList();
      refreshLandingSelect();
    } catch {
      console.log('No JSON found on server.');
      renderLangTabs();
      renderCardList();
    }
  }

  autoLoad();
})();
