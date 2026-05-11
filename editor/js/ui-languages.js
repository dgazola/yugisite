let selectedLangIndex = -1;   // index in editorData.settings.languages

// ── Render language list (left panel) ───────────────────
function editorRenderLanguageList() {
  const container = document.getElementById('langListContainer');
  const langs = window.editorData.settings.languages;
  container.innerHTML = '';

  langs.forEach((lang, idx) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    if (idx === selectedLangIndex) item.classList.add('selected');
    item.innerHTML = `
      <div class="list-item-title">${lang.toUpperCase()}</div>
      <div class="list-item-actions">
        ${lang !== 'en' ? '<button class="remove-btn" title="Remove">✕</button>' : ''}
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      selectedLangIndex = idx;
      editorRenderLanguageList();
      editorRenderSelectedLanguage();
    });

    const removeBtn = item.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Remove language '${lang}'? This will delete all translations for that language.`)) {
          editorRemoveLanguage(lang);
        }
      });
    }

    container.appendChild(item);
  });

  // Add language input at the bottom of the list
  const addDiv = document.createElement('div');
  addDiv.className = 'add-language';
  addDiv.innerHTML = `
    <input type="text" id="newLangCode" placeholder="e.g. es, fr" maxlength="5" />
    <button id="addLanguageBtn" class="btn btn-primary">Add</button>
  `;
  container.appendChild(addDiv);

  document.getElementById('addLanguageBtn').addEventListener('click', editorAddLanguage);

  // Allow pressing Enter in the input to add
  document.getElementById('newLangCode').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') editorAddLanguage();
  });

  // Keep selection valid
  if (selectedLangIndex < 0 || selectedLangIndex >= langs.length) {
    selectedLangIndex = 0;
    if (langs.length > 0) {
      container.querySelectorAll('.list-item')[0]?.classList.add('selected');
    }
  }

  editorRenderSelectedLanguage();
}

// ── Render selected language editor (right panel) ────────
function editorRenderSelectedLanguage() {
  const container = document.getElementById('langEditContainer');
  const langs = window.editorData.settings.languages;
  const lang = langs[selectedLangIndex];
  if (!lang) {
    container.innerHTML = '<div style="padding:20px;color:#5c5430;">No language selected.</div>';
    return;
  }

  const siteTitle = window.editorData.settings.siteTitle[lang] || '';

  const el = document.createElement('div');
  el.className = 'card-editor';
  el.innerHTML = `
    <div class="card-editor-header">
      <h4>Editing language: <span style="color:var(--editor-accent)">${lang.toUpperCase()}</span></h4>
    </div>
    <div class="form-group">
      <label>Site Title</label>
      <input type="text" class="field-site-title" value="${editorEscapeHtml(siteTitle)}" />
    </div>
    <p class="help-text" style="margin-top:8px;">The site title is displayed in the top bar and browser tab.</p>
  `;

  el.querySelector('.field-site-title').addEventListener('input', (e) => {
    if (!window.editorData.settings.siteTitle) window.editorData.settings.siteTitle = {};
    window.editorData.settings.siteTitle[lang] = e.target.value;
  });

  container.innerHTML = '';
  container.appendChild(el);
}

// ── Add / Remove language ──────────────────────────────
function editorAddLanguage() {
  const codeInput = document.getElementById('newLangCode');
  if (!codeInput) return;
  const code = codeInput.value.trim().toLowerCase();
  if (!code) return alert('Please enter a language code.');
  if (window.editorData.settings.languages.includes(code)) return alert('Language already exists.');

  window.editorData.settings.languages.push(code);

  // Add empty translations to cards
  window.editorData.cards.forEach(card => {
    if (!card.translations) card.translations = {};
    card.translations[code] = {
      name: "", sub: "", label: "", title: "", description: "", meta: "", tag: "", link: ""
    };
  });
  // Articles
  window.blogArticles.forEach(a => {
    if (!a.translations) a.translations = {};
    a.translations[code] = {
      name: "", sub: "", label: "", title: "", description: "", meta: "", tag: "",
      articleTitle: "", articleBody: ""
    };
  });
  window.devlogArticles.forEach(a => {
    if (!a.translations) a.translations = {};
    a.translations[code] = {
      name: "", sub: "", label: "", title: "", description: "", meta: "", tag: "",
      articleTitle: "", articleBody: ""
    };
  });
  // Site title
  if (!window.editorData.settings.siteTitle) window.editorData.settings.siteTitle = {};
  window.editorData.settings.siteTitle[code] = "Life Snake Studio";

  codeInput.value = '';
  selectedLangIndex = window.editorData.settings.languages.indexOf(code);
  editorRenderLanguageList();
  editorRefreshLandingSelect();

  // Notify the editor that languages changed (second-lang selector)
  if (window.editorOnLanguagesChanged) window.editorOnLanguagesChanged();
}

function editorRemoveLanguage(lang) {
  window.editorData.settings.languages = window.editorData.settings.languages.filter(l => l !== lang);
  window.editorData.cards.forEach(card => {
    if (card.translations) delete card.translations[lang];
  });
  window.blogArticles.forEach(a => { if (a.translations) delete a.translations[lang]; });
  window.devlogArticles.forEach(a => { if (a.translations) delete a.translations[lang]; });
  if (window.editorData.settings.siteTitle) delete window.editorData.settings.siteTitle[lang];

  if (selectedLangIndex >= window.editorData.settings.languages.length) {
    selectedLangIndex = Math.max(0, window.editorData.settings.languages.length - 1);
  }
  editorRenderLanguageList();
  editorRefreshLandingSelect();

  if (window.editorOnLanguagesChanged) window.editorOnLanguagesChanged();
}