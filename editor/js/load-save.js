// Load/Save/Upload functions

function editorProcessLoadedJson(json) {
  let cards, settings, menu;
  if (Array.isArray(json)) {
    cards = json.map(c => editorMigrateOldCard(c));
    settings = { landingCardId: "", defaultLanguage: "en", languages: ["en"], siteTitle: { "en": "Life Snake Studio" } };
    menu = [];
  } else {
    cards = json.cards.map(c => {
      if (!c.translations) return editorMigrateOldCard(c);
      return c;
    });
    settings = json.settings || {};
    menu = json.menu || [];
    if (!settings.defaultLanguage) settings.defaultLanguage = "en";
    if (!settings.languages) settings.languages = ["en"];
    if (!settings.siteTitle) settings.siteTitle = { "en": "Life Snake Studio" };
    cards.forEach(c => {
      c.translations = editorEnsureTranslations(c.translations, settings.languages);
    });
    menu.forEach(item => {
      item.translations = editorEnsureTranslations(item.translations, settings.languages);
    });
  }

  window.editorData = { settings, menu, cards };
  window.editorState.currentLang = settings.defaultLanguage || 'en';
  window.editorState.currentMainTab = 'cards';

  // Reset UI
  document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="cards"]').classList.add('active');
  document.getElementById('panelCards').style.display = 'block';
  document.getElementById('panelMenu').style.display = 'none';
  document.getElementById('panelLanguages').style.display = 'none';
  document.getElementById('cardList').style.display = 'block';
  document.getElementById('menuEditArea').style.display = 'none';

  editorReorderAll();
  editorRenderLangTabs();
  editorRenderCardList();
  editorRenderMenuList();
  editorRefreshLandingSelect();
}

function editorLoadLocal() {
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
        editorProcessLoadedJson(json);
      } catch (err) { alert('Failed to parse JSON: ' + err.message); }
    };
    reader.readAsText(file);
  });
  input.click();
}

function editorLoadUrl() {
  const url = prompt('Enter the URL of the JSON file:');
  if (!url) return;
  fetch(url)
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      return resp.json();
    })
    .then(json => editorProcessLoadedJson(json))
    .catch(err => alert('Failed to fetch JSON: ' + err.message));
}

function editorLoadRepo() {
  const defaultUrl = 'https://raw.githubusercontent.com/dgazola/yugisite/main/Content/mainpagecards.json';
  const url = prompt('Enter the raw GitHub URL:', defaultUrl);
  if (!url) return;
  fetch(url)
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      return resp.json();
    })
    .then(json => editorProcessLoadedJson(json))
    .catch(err => alert('Failed to fetch JSON: ' + err.message));
}

function editorSave() {
  editorReorderAll();
  window.editorData.cards.forEach(c => { if (!c.id) c.id = editorGenerateId(); });
  if (window.editorData.settings.landingCardId && !window.editorData.cards.find(c => c.id === window.editorData.settings.landingCardId))
    window.editorData.settings.landingCardId = "";

  const json = JSON.stringify(window.editorData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mainpagecards.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function editorUploadToRepo() {
  editorReorderAll();
  window.editorData.cards.forEach(c => { if (!c.id) c.id = editorGenerateId(); });
  if (window.editorData.settings.landingCardId && !window.editorData.cards.find(c => c.id === window.editorData.settings.landingCardId))
    window.editorData.settings.landingCardId = "";
  const jsonContent = JSON.stringify(window.editorData, null, 2);

  let token = localStorage.getItem('github_token') || '';
  let repo = localStorage.getItem('github_repo') || 'dgazola/yugisite';
  let branch = localStorage.getItem('github_branch') || 'main';
  let path = localStorage.getItem('github_path') || 'Content/mainpagecards.json';

  token = prompt('GitHub Personal Access Token (will be saved locally):', token);
  if (!token) return;
  localStorage.setItem('github_token', token);

  repo = prompt('Repository (owner/repo):', repo);
  if (!repo) return;
  localStorage.setItem('github_repo', repo);

  branch = prompt('Branch name:', branch);
  if (!branch) return;
  localStorage.setItem('github_branch', branch);

  path = prompt('File path in repo:', path);
  if (!path) return;
  localStorage.setItem('github_path', path);

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    let sha = null;
    try {
      const getResp = await fetch(apiUrl, {
        headers: { 'Authorization': `token ${token}` }
      });
      if (getResp.ok) {
        const fileData = await getResp.json();
        sha = fileData.sha;
      } else if (getResp.status !== 404) {
        throw new Error(`GitHub API error: ${getResp.status}`);
      }
    } catch (e) { /* file might not exist */ }

    const commitMessage = prompt('Commit message:', 'Update mainpagecards.json via editor');
    if (!commitMessage) return;

    const body = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(jsonContent))),
      branch: branch
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!putResp.ok) {
      const err = await putResp.json();
      throw new Error(err.message || `HTTP ${putResp.status}`);
    }

    alert('✅ File uploaded successfully to GitHub!');
  } catch (err) {
    alert('❌ Upload failed: ' + err.message);
  }
}
