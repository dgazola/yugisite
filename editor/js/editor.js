(function() {
  // ── Data stores ──────────────────────────────────────
  let mainData = { settings: { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } }, menu: [], cards: [] };
  let blogEntries = [];
  let devlogEntries = [];

  let currentColumn = "main";
  let currentLang = "en";
  let currentMainTab = "cards";

  // GitHub config
  let gitToken = localStorage.getItem('github_token') || '';
  let gitRepo = localStorage.getItem('github_repo') || 'dgazola/yugisite';
  let gitBranch = localStorage.getItem('github_branch') || 'main';
  let gitBasePath = 'Content';

  // DOM refs
  const mainTabs = document.getElementById('mainTabs');
  const panelCards = document.getElementById('panelCards');
  const panelMenu = document.getElementById('panelMenu');
  const panelLanguages = document.getElementById('panelLanguages');
  const panelBlog = document.getElementById('panelBlog');
  const panelDevlog = document.getElementById('panelDevlog');
  const columnTabs = document.getElementById('columnTabs');
  const langTabsEl = document.getElementById('langTabs');
  const landingSelect = document.getElementById('landingCardSelect');
  const cardList = document.getElementById('cardList');
  const menuEditArea = document.getElementById('menuEditArea');
  const blogEditArea = document.getElementById('blogEditArea');
  const devlogEditArea = document.getElementById('devlogEditArea');
  const menuList = document.getElementById('menuList');
  const blogList = document.getElementById('blogList');
  const devlogList = document.getElementById('devlogList');
  const langList = document.getElementById('langList');
  const addCardBtn = document.getElementById('addCardBtn');
  const addMenuItemBtn = document.getElementById('addMenuItemBtn');
  const addLanguageBtn = document.getElementById('addLanguageBtn');
  const addBlogBtn = document.getElementById('addBlogBtn');
  const addDevlogBtn = document.getElementById('addDevlogBtn');
  const newLangCode = document.getElementById('newLangCode');
  const saveBtn = document.getElementById('saveBtn');
  const revertBtn = document.getElementById('revertBtn');

  // ── Utils ────────────────────────────────────────────
  function generateId() { return 'card-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2,4); }
  function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
  function ensureTranslations(obj, langs) {
    if (!obj) obj = {};
    langs.forEach(l => { if (!obj[l]) obj[l] = (l === 'en' ? '' : (obj['en'] || '')); });
    return obj;
  }
  function reorderCards(col) { let o = 0; mainData.cards.forEach(c => { if (c.column === col) c.order = o++; }); }
  function reorderAllCards() { ['main','devlog','blog'].forEach(c => reorderCards(c)); }

  // ── Language & UI tabs ───────────────────────────────
  function renderLangTabs() {
    const langs = mainData.settings.languages || ["en"];
    if (!langs.includes("en")) langs.unshift("en");
    mainData.settings.languages = langs;
    langTabsEl.innerHTML = '<span style="font-size:0.7rem;text-transform:uppercase;color:var(--editor-muted);margin-right:8px;">Editing:</span>';
    langs.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'tab lang-tab' + (l === currentLang ? ' active' : '');
      btn.textContent = l.toUpperCase();
      btn.addEventListener('click', () => { currentLang = l; renderLangTabs(); renderCurrentTab(); });
      langTabsEl.appendChild(btn);
    });
  }

  function refreshLandingSelect() {
    const cur = landingSelect.value;
    landingSelect.innerHTML = '<option value="">— None —</option>';
    mainData.cards.forEach(card => {
      const trans = card.translations && card.translations[currentLang] ? card.translations[currentLang]
                    : (card.translations && card.translations[mainData.settings.defaultLanguage] ? card.translations[mainData.settings.defaultLanguage] : {title:''});
      const label = `${card.column}: ${trans.title || '(untitled)'}`;
      landingSelect.innerHTML += `<option value="${card.id}">${label}</option>`;
    });
    if (mainData.cards.find(c => c.id === cur)) landingSelect.value = cur;
    else if (mainData.settings.landingCardId) landingSelect.value = mainData.settings.landingCardId;
  }
  landingSelect.addEventListener('change', () => { mainData.settings.landingCardId = landingSelect.value; });

  function switchMainTab(tabName) {
    currentMainTab = tabName;
    mainTabs.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    mainTabs.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    panelCards.style.display = tabName === 'cards' ? 'block' : 'none';
    panelMenu.style.display = tabName === 'menu' ? 'block' : 'none';
    panelLanguages.style.display = tabName === 'languages' ? 'block' : 'none';
    panelBlog.style.display = tabName === 'blog' ? 'block' : 'none';
    panelDevlog.style.display = tabName === 'devlog' ? 'block' : 'none';
    cardList.style.display = (tabName === 'cards' || tabName === 'menu') ? 'block' : 'none';
    menuEditArea.style.display = tabName === 'menu' ? 'block' : 'none';
    blogEditArea.style.display = tabName === 'blog' ? 'block' : 'none';
    devlogEditArea.style.display = tabName === 'devlog' ? 'block' : 'none';
    renderCurrentTab();
  }

  function renderCurrentTab() {
    if (currentMainTab === 'cards') renderCardList();
    else if (currentMainTab === 'menu') { renderMenuList(); renderMenuEdit(); }
    else if (currentMainTab === 'languages') renderLanguageList();
    else if (currentMainTab === 'blog') { renderBlogList(); renderBlogEdit(); }
    else if (currentMainTab === 'devlog') { renderDevlogList(); renderDevlogEdit(); }
  }

  mainTabs.addEventListener('click', e => {
    const tab = e.target.closest('.main-tab');
    if (!tab) return;
    switchMainTab(tab.getAttribute('data-tab'));
  });

  // ── Cards tab ─────────────────────────────────────────
  function getColumnCards() { return mainData.cards.filter(c => c.column === currentColumn); }
  function renderCardList() {
    const cards = getColumnCards();
    cardList.innerHTML = '';
    if (cards.length === 0) {
      cardList.innerHTML = '<p style="color:#5c5430; text-align:center; padding:40px;">No cards. Click "+ Add Card".</p>';
      return;
    }
    cards.forEach((card, idx) => {
      card.translations = ensureTranslations(card.translations, mainData.settings.languages);
      const t = card.translations[currentLang] || card.translations[mainData.settings.defaultLanguage] || {};
      const el = document.createElement('div');
      el.className = 'card-editor';
      el.innerHTML = `
        <div class="card-editor-header">
          <h4>Card #${idx+1} (${currentLang.toUpperCase()})</h4>
          <span class="card-id">${card.id}</span>
          <div style="display:flex; gap:4px;">
            <button class="btn-icon move-up">▲</button><button class="btn-icon move-down">▼</button><button class="btn-icon remove-card">✕</button>
          </div>
        </div>
        <div class="form-group"><label>UI Mode</label><select class="field-uimode"><option value="opaque" ${card.uiMode==='opaque'?'selected':''}>Opaque</option><option value="transparent" ${card.uiMode==='transparent'?'selected':''}>Transparent</option></select></div>
        <div class="form-group"><label>Image URL</label><input type="text" class="field-imageurl" value="${escapeHtml(card.imageUrl||'')}"></div>
        <div class="form-group"><label>WebM Video URL</label><input type="text" class="field-videourl" value="${escapeHtml(card.videoUrl||'')}"></div>
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
      el.querySelector('.remove-card').onclick = () => removeCard(card.id);
      el.querySelector('.move-up').onclick = () => moveCard(card.id, -1);
      el.querySelector('.move-down').onclick = () => moveCard(card.id, 1);
      el.querySelector('.field-uimode').onchange = e => card.uiMode = e.target.value;
      el.querySelector('.field-imageurl').oninput = e => card.imageUrl = e.target.value;
      el.querySelector('.field-videourl').oninput = e => card.videoUrl = e.target.value;
      const sync = (field, value) => { card.translations[currentLang][field] = value; refreshLandingSelect(); };
      el.querySelector('.field-title').oninput = e => sync('title', e.target.value);
      el.querySelector('.field-desc').oninput = e => sync('description', e.target.value);
      if (card.column === 'main') {
        el.querySelector('.field-name').oninput = e => sync('name', e.target.value);
        el.querySelector('.field-sub').oninput = e => sync('sub', e.target.value);
        el.querySelector('.field-tag').oninput = e => sync('tag', e.target.value);
      } else {
        el.querySelector('.field-label').oninput = e => sync('label', e.target.value);
        el.querySelector('.field-meta').oninput = e => sync('meta', e.target.value);
      }
      cardList.appendChild(el);
    });
  }
  function addCard() {
    const newCard = { column: currentColumn, order: getColumnCards().length, type: currentColumn, id: generateId(), uiMode: 'opaque', imageUrl: null, videoUrl: null, translations: {} };
    mainData.settings.languages.forEach(l => newCard.translations[l] = { name:"", sub:"", label:"", title:"New Card", description:"", meta:"", tag:"" });
    mainData.cards.push(newCard);
    reorderCards(currentColumn);
    renderCardList();
    refreshLandingSelect();
  }
  function removeCard(id) {
    if (!confirm('Remove?')) return;
    mainData.cards = mainData.cards.filter(c => c.id !== id);
    reorderCards(currentColumn);
    renderCardList();
    refreshLandingSelect();
  }
  function moveCard(id, dir) {
    const colCards = mainData.cards.filter(c => c.column === currentColumn);
    const idx = colCards.findIndex(c => c.id === id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= colCards.length) return;
    const ga = mainData.cards.indexOf(colCards[idx]), gb = mainData.cards.indexOf(colCards[swapIdx]);
    [mainData.cards[ga], mainData.cards[gb]] = [mainData.cards[gb], mainData.cards[ga]];
    reorderCards(currentColumn);
    renderCardList();
  }
  addCardBtn.onclick = addCard;
  columnTabs.addEventListener('click', e => {
    const tab = e.target.closest('.col-tab');
    if (!tab) return;
    columnTabs.querySelectorAll('.col-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentColumn = tab.getAttribute('data-column');
    renderCardList();
    refreshLandingSelect();
  });

  // ── Menu tab ──────────────────────────────────────────
  function renderMenuList() {
    menuList.innerHTML = '';
    (mainData.menu || []).forEach((item, idx) => {
      const label = item.translations[currentLang] || item.translations[mainData.settings.defaultLanguage] || item.id;
      const div = document.createElement('div');
      div.className = 'menu-editor-item';
      div.innerHTML = `<span>${idx+1}. ${label} (${item.id})</span><button class="btn-icon remove-menu-item">✕</button>`;
      div.querySelector('.remove-menu-item').onclick = () => {
        if (confirm('Remove?')) { mainData.menu.splice(idx,1); renderMenuList(); renderMenuEdit(); }
      };
      menuList.appendChild(div);
    });
  }
  function renderMenuEdit() {
    menuEditArea.innerHTML = '';
    (mainData.menu || []).forEach((item, idx) => {
      item.translations = ensureTranslations(item.translations, mainData.settings.languages);
      const label = item.translations[currentLang] || item.translations[mainData.settings.defaultLanguage] || item.id;
      const el = document.createElement('div');
      el.className = 'card-editor';
      el.innerHTML = `
        <div class="card-editor-header"><h4>Menu #${idx+1}</h4><span class="card-id">${item.id}</span>
          <div><button class="btn-icon move-up">▲</button><button class="btn-icon move-down">▼</button><button class="btn-icon remove-menu">✕</button></div>
        </div>
        <div class="form-group"><label>Label (${currentLang})</label><input type="text" class="menu-label" value="${escapeHtml(label)}"></div>`;
      el.querySelector('.remove-menu').onclick = () => { if(confirm('Remove?')) { mainData.menu.splice(idx,1); renderMenuList(); renderMenuEdit(); } };
      el.querySelector('.move-up').onclick = () => { if(idx>0) { [mainData.menu[idx],mainData.menu[idx-1]]=[mainData.menu[idx-1],mainData.menu[idx]]; renderMenuList(); renderMenuEdit(); } };
      el.querySelector('.move-down').onclick = () => { if(idx<mainData.menu.length-1) { [mainData.menu[idx],mainData.menu[idx+1]]=[mainData.menu[idx+1],mainData.menu[idx]]; renderMenuList(); renderMenuEdit(); } };
      el.querySelector('.menu-label').oninput = e => { item.translations[currentLang] = e.target.value; renderMenuList(); };
      menuEditArea.appendChild(el);
    });
    if (!mainData.menu.length) menuEditArea.innerHTML = '<p style="color:#5c5430;">No menu items.</p>';
  }
  addMenuItemBtn.onclick = () => {
    const id = prompt('Card ID for this menu item:');
    if (!id) return;
    if (mainData.menu.find(m => m.id === id)) { alert('Exists.'); return; }
    const item = { id, translations: {} };
    mainData.settings.languages.forEach(l => item.translations[l] = id);
    mainData.menu.push(item);
    renderMenuList(); renderMenuEdit();
  };

  // ── Languages tab ─────────────────────────────────────
  function renderLanguageList() {
    langList.innerHTML = '';
    mainData.settings.languages.forEach(l => {
      const div = document.createElement('div');
      div.className = 'lang-editor-item';
      div.innerHTML = `<span>${l.toUpperCase()}</span><button class="btn-icon remove-lang" ${l==='en'?'disabled':''}>✕</button>`;
      if (l !== 'en') div.querySelector('.remove-lang').onclick = () => { if(confirm(`Remove ${l}?`)) removeLanguage(l); };
      langList.appendChild(div);
    });
  }
  function removeLanguage(lang) {
    mainData.settings.languages = mainData.settings.languages.filter(l => l !== lang);
    mainData.cards.forEach(c => { if (c.translations) delete c.translations[lang]; });
    mainData.menu.forEach(item => { if (item.translations) delete item.translations[lang]; });
    if (currentLang === lang) currentLang = mainData.settings.defaultLanguage || 'en';
    renderLanguageList(); renderLangTabs(); renderCurrentTab(); refreshLandingSelect();
  }
  addLanguageBtn.onclick = () => {
    const code = newLangCode.value.trim().toLowerCase();
    if (!code) return alert('Enter code.');
    if (mainData.settings.languages.includes(code)) return alert('Exists.');
    mainData.settings.languages.push(code);
    mainData.cards.forEach(c => { if (!c.translations) c.translations = {}; c.translations[code] = { name:"", sub:"", label:"", title:"", description:"", meta:"", tag:"" }; });
    mainData.menu.forEach(item => { if (!item.translations) item.translations = {}; item.translations[code] = item.translations[mainData.settings.defaultLanguage] || item.id; });
    newLangCode.value = '';
    renderLanguageList(); renderLangTabs(); renderCurrentTab(); refreshLandingSelect();
  };

  // ── Blog dummy tab ────────────────────────────────────
  function renderBlogList() {
    blogList.innerHTML = '';
    blogEntries.forEach((entry, idx) => {
      const div = document.createElement('div');
      div.className = 'menu-editor-item';
      div.innerHTML = `<span>${idx+1}. ${escapeHtml(entry.title || 'Untitled')}</span><button class="btn-icon remove-blog">✕</button>`;
      div.querySelector('.remove-blog').onclick = () => { if(confirm('Remove?')) { blogEntries.splice(idx,1); renderBlogList(); renderBlogEdit(); } };
      blogList.appendChild(div);
    });
  }
  function renderBlogEdit() {
    blogEditArea.innerHTML = '';
    blogEntries.forEach((entry, idx) => {
      const el = document.createElement('div');
      el.className = 'card-editor';
      el.innerHTML = `
        <div class="card-editor-header"><h4>Blog #${idx+1}</h4><button class="btn-icon remove-blog-entry">✕</button></div>
        <div class="form-group"><label>Title</label><input type="text" class="blog-title" value="${escapeHtml(entry.title||'')}"></div>
        <div class="form-group"><label>Body</label><textarea rows="4" class="blog-body">${escapeHtml(entry.body||'')}</textarea></div>`;
      el.querySelector('.remove-blog-entry').onclick = () => { if(confirm('Remove?')) { blogEntries.splice(idx,1); renderBlogList(); renderBlogEdit(); } };
      el.querySelector('.blog-title').oninput = e => { entry.title = e.target.value; renderBlogList(); };
      el.querySelector('.blog-body').oninput = e => { entry.body = e.target.value; };
      blogEditArea.appendChild(el);
    });
    if (!blogEntries.length) blogEditArea.innerHTML = '<p style="color:#5c5430;">No blog entries.</p>';
  }
  addBlogBtn.onclick = () => { blogEntries.push({ title: 'New Post', body: '' }); renderBlogList(); renderBlogEdit(); };

  // ── Devlog dummy tab ──────────────────────────────────
  function renderDevlogList() {
    devlogList.innerHTML = '';
    devlogEntries.forEach((entry, idx) => {
      const div = document.createElement('div');
      div.className = 'menu-editor-item';
      div.innerHTML = `<span>${idx+1}. ${escapeHtml(entry.title || 'Untitled')}</span><button class="btn-icon remove-devlog">✕</button>`;
      div.querySelector('.remove-devlog').onclick = () => { if(confirm('Remove?')) { devlogEntries.splice(idx,1); renderDevlogList(); renderDevlogEdit(); } };
      devlogList.appendChild(div);
    });
  }
  function renderDevlogEdit() {
    devlogEditArea.innerHTML = '';
    devlogEntries.forEach((entry, idx) => {
      const el = document.createElement('div');
      el.className = 'card-editor';
      el.innerHTML = `
        <div class="card-editor-header"><h4>Devlog #${idx+1}</h4><button class="btn-icon remove-devlog-entry">✕</button></div>
        <div class="form-group"><label>Title</label><input type="text" class="devlog-title" value="${escapeHtml(entry.title||'')}"></div>
        <div class="form-group"><label>Body</label><textarea rows="4" class="devlog-body">${escapeHtml(entry.body||'')}</textarea></div>`;
      el.querySelector('.remove-devlog-entry').onclick = () => { if(confirm('Remove?')) { devlogEntries.splice(idx,1); renderDevlogList(); renderDevlogEdit(); } };
      el.querySelector('.devlog-title').oninput = e => { entry.title = e.target.value; renderDevlogList(); };
      el.querySelector('.devlog-body').oninput = e => { entry.body = e.target.value; };
      devlogEditArea.appendChild(el);
    });
    if (!devlogEntries.length) devlogEditArea.innerHTML = '<p style="color:#5c5430;">No devlog entries.</p>';
  }
  addDevlogBtn.onclick = () => { devlogEntries.push({ title: 'New Devlog', body: '' }); renderDevlogList(); renderDevlogEdit(); };

  // ── GitHub API helpers (FIXED: fetch latest SHA right before upload) ──
  async function getLatestSha(path) {
    const url = `https://api.github.com/repos/${gitRepo}/contents/${path}`;
    const resp = await fetch(url, { headers: { 'Authorization': `token ${gitToken}` } });
    if (resp.status === 404) return null; // file doesn't exist
    if (!resp.ok) throw new Error(`Fetch SHA failed: ${resp.status}`);
    const data = await resp.json();
    return data.sha;
  }

  async function uploadFile(path, content, message) {
    // Always fetch the current SHA right before uploading
    const sha = await getLatestSha(path);
    const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch: gitBranch };
    if (sha) body.sha = sha;
    const putResp = await fetch(`https://api.github.com/repos/${gitRepo}/contents/${path}`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${gitToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!putResp.ok) {
      const errData = await putResp.json();
      throw new Error(errData.message || `HTTP ${putResp.status}`);
    }
  }

  async function loadFile(path) {
    const url = `https://raw.githubusercontent.com/${gitRepo}/${gitBranch}/${path}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  }

  function promptForConfig() {
    if (!gitToken) {
      gitToken = prompt('GitHub Personal Access Token (repo scope):', '');
      if (!gitToken) throw new Error('Token required');
      localStorage.setItem('github_token', gitToken);
    }
    gitRepo = prompt('Repository (owner/repo):', gitRepo) || gitRepo;
    gitBranch = prompt('Branch:', gitBranch) || gitBranch;
    localStorage.setItem('github_repo', gitRepo);
    localStorage.setItem('github_branch', gitBranch);
  }

  // ── Load ALL content from repo ───────────────────────
  async function loadAllFromRepo() {
    try {
      promptForConfig();
      const [mainJson, blogJson, devlogJson] = await Promise.all([
        loadFile(`${gitBasePath}/mainpagecards.json`),
        loadFile(`${gitBasePath}/blog.json`),
        loadFile(`${gitBasePath}/devlog.json`)
      ]);
      if (Array.isArray(mainJson)) {
        mainData = { settings: { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } }, menu: [], cards: mainJson.map(c => migrateOldCard(c)) };
      } else {
        mainData = mainJson;
        if (!mainData.settings) mainData.settings = { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } };
        if (!mainData.settings.languages) mainData.settings.languages = ["en"];
        if (!mainData.menu) mainData.menu = [];
        mainData.cards.forEach(c => {
          if (!c.translations) c.translations = {};
          mainData.settings.languages.forEach(l => { if (!c.translations[l]) c.translations[l] = { name:"", sub:"", label:"", title:c.title||"", description:c.description||"", meta:"", tag:"" }; });
        });
        mainData.menu.forEach(item => item.translations = ensureTranslations(item.translations, mainData.settings.languages));
      }
      blogEntries = Array.isArray(blogJson) ? blogJson : [];
      devlogEntries = Array.isArray(devlogJson) ? devlogJson : [];
    } catch (err) {
      alert('Failed to load from repo: ' + err.message);
    }
    currentLang = mainData.settings.defaultLanguage || 'en';
    reorderAllCards();
    renderLangTabs();
    switchMainTab('cards');
    refreshLandingSelect();
  }

  function migrateOldCard(c) {
    return {
      column: c.column || "main", order: c.order || 0, type: c.type || c.column, id: c.id || generateId(),
      uiMode: c.uiMode || 'opaque', imageUrl: c.imageUrl || null, videoUrl: c.videoUrl || null,
      translations: { en: { name: c.name||"", sub: c.sub||"", label: c.label||"", title: c.title||"", description: c.description||"", meta: c.meta||"", tag: c.tag||"" } }
    };
  }

  // ── Save ALL content to repo (now safe from SHA mismatch) ──
  async function saveAllToRepo() {
    try {
      promptForConfig();
      reorderAllCards();
      mainData.cards.forEach(c => { if (!c.id) c.id = generateId(); });
      if (mainData.settings.landingCardId && !mainData.cards.find(c => c.id === mainData.settings.landingCardId))
        mainData.settings.landingCardId = "";

      const commitMsg = prompt('Commit message:', 'Update content');
      if (!commitMsg) return;

      // Upload each file – each call will fetch the latest SHA right before uploading
      await Promise.all([
        uploadFile(`${gitBasePath}/mainpagecards.json`, JSON.stringify(mainData, null, 2), commitMsg),
        uploadFile(`${gitBasePath}/blog.json`, JSON.stringify(blogEntries, null, 2), commitMsg),
        uploadFile(`${gitBasePath}/devlog.json`, JSON.stringify(devlogEntries, null, 2), commitMsg)
      ]);
      alert('✅ All content saved to repo.');
    } catch (err) {
      alert('❌ Save failed: ' + err.message);
    }
  }

  // ── Button events ─────────────────────────────────────
  saveBtn.onclick = saveAllToRepo;
  revertBtn.onclick = async () => {
    if (confirm('Revert all changes? Unsaved work will be lost.')) await loadAllFromRepo();
  };

  // ── Init: auto-load from repo ─────────────────────────
  (async function init() {
    if (gitToken) {
      try { await loadAllFromRepo(); } catch(e) { console.log('Auto-load failed, showing empty editor.'); renderLangTabs(); renderCardList(); }
    } else {
      renderLangTabs();
      renderCardList();
    }
  })();
})();
