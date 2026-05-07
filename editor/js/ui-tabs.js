// Language tabs (the small language buttons at the top) and main tab switching

function editorRenderLangTabs() {
  const langs = window.editorData.settings.languages || ["en"];
  if (!langs.includes("en")) langs.unshift("en");
  window.editorData.settings.languages = langs;

  const container = document.getElementById('langTabs');
  container.innerHTML = '<span style="font-size:0.7rem;text-transform:uppercase;color:var(--editor-muted);margin-right:8px;">Editing:</span>';
  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'tab lang-tab' + (lang === window.editorState.currentLang ? ' active' : '');
    btn.textContent = lang.toUpperCase();
    btn.addEventListener('click', () => {
      window.editorState.currentLang = lang;
      editorRenderLangTabs();
      if (window.editorState.currentMainTab === 'cards') editorRenderCardList();
      else if (window.editorState.currentMainTab === 'menu') editorRenderMenuEdit();
    });
    container.appendChild(btn);
  });
}

// Main tab switching (Cards / Menu / Languages)
document.addEventListener('DOMContentLoaded', function() {
  const mainTabs = document.getElementById('mainTabs');
  mainTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.main-tab');
    if (!tab) return;
    const tabName = tab.getAttribute('data-tab');
    if (tabName === window.editorState.currentMainTab) return;
    window.editorState.currentMainTab = tabName;
    mainTabs.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.getElementById('panelCards').style.display = tabName === 'cards' ? 'block' : 'none';
    document.getElementById('panelMenu').style.display = tabName === 'menu' ? 'block' : 'none';
    document.getElementById('panelLanguages').style.display = tabName === 'languages' ? 'block' : 'none';

    if (tabName === 'cards') {
      document.getElementById('cardList').style.display = 'block';
      document.getElementById('menuEditArea').style.display = 'none';
      editorRenderCardList();
    } else if (tabName === 'menu') {
      document.getElementById('cardList').style.display = 'none';
      document.getElementById('menuEditArea').style.display = 'block';
      editorRenderMenuList();
      editorRenderMenuEdit();
    } else if (tabName === 'languages') {
      document.getElementById('cardList').style.display = 'none';
      document.getElementById('menuEditArea').style.display = 'none';
      editorRenderLanguageList();
    }
  });

  // Column tab switching (Main / Devlog / Blog)
  const columnTabs = document.getElementById('columnTabs');
  columnTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.col-tab');
    if (!tab) return;
    columnTabs.querySelectorAll('.col-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    window.editorState.currentColumn = tab.getAttribute('data-column');
    editorRenderCardList();
    editorRefreshLandingSelect();
  });
});
