// Language list rendering and add/remove

function editorRenderLanguageList() {
  const langList = document.getElementById('langList');
  langList.innerHTML = '';
  window.editorData.settings.languages.forEach(lang => {
    const div = document.createElement('div');
    div.className = 'lang-editor-item';
    div.innerHTML = `<span>${lang.toUpperCase()}</span>
      <button class="btn-icon remove-lang" data-lang="${lang}" ${lang === 'en' ? 'disabled title="Cannot remove default fallback"' : ''}>✕</button>`;
    div.querySelector('.remove-lang')?.addEventListener('click', (e) => {
      if (lang === 'en') return;
      if (confirm(`Remove language '${lang}'? This will delete all translations for that language.`)) {
        editorRemoveLanguage(lang);
      }
    });
    langList.appendChild(div);
  });
}

function editorRemoveLanguage(lang) {
  window.editorData.settings.languages = window.editorData.settings.languages.filter(l => l !== lang);
  window.editorData.cards.forEach(card => {
    if (card.translations) delete card.translations[lang];
  });
  window.editorData.menu.forEach(item => {
    if (item.translations) delete item.translations[lang];
  });
  if (window.editorState.currentLang === lang) {
    window.editorState.currentLang = window.editorData.settings.defaultLanguage || 'en';
  }
  editorRenderLanguageList();
  editorRenderLangTabs();
  if (window.editorState.currentMainTab === 'cards') editorRenderCardList();
  else if (window.editorState.currentMainTab === 'menu') editorRenderMenuEdit();
  editorRenderMenuList();
  editorRefreshLandingSelect();
}

function editorAddLanguage() {
  const code = document.getElementById('newLangCode').value.trim().toLowerCase();
  if (!code) return alert('Please enter a language code.');
  if (window.editorData.settings.languages.includes(code)) return alert('Language already exists.');
  window.editorData.settings.languages.push(code);
  window.editorData.cards.forEach(card => {
    if (!card.translations) card.translations = {};
    card.translations[code] = { name:"", sub:"", label:"", title:"", description:"", meta:"", tag:"" };
  });
  window.editorData.menu.forEach(item => {
    if (!item.translations) item.translations = {};
    item.translations[code] = item.translations[window.editorData.settings.defaultLanguage] || item.id;
  });
  document.getElementById('newLangCode').value = '';
  editorRenderLanguageList();
  editorRenderLangTabs();
  if (window.editorState.currentMainTab === 'cards') editorRenderCardList();
  else if (window.editorState.currentMainTab === 'menu') editorRenderMenuEdit();
  editorRenderMenuList();
  editorRefreshLandingSelect();
}
