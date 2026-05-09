// No more language tabs – all languages are displayed side‑by‑side in fields.
// This file now only handles main tab switching (Cards/Articles/Menu/Languages)
// and the article sub‑tab (Blog/Devlog).

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
    document.getElementById('panelArticles').style.display = tabName === 'articles' ? 'block' : 'none';
    document.getElementById('panelMenu').style.display = tabName === 'menu' ? 'block' : 'none';
    document.getElementById('panelLanguages').style.display = tabName === 'languages' ? 'block' : 'none';

    document.getElementById('cardList').style.display = tabName === 'cards' ? 'block' : 'none';
    document.getElementById('articleList').style.display = tabName === 'articles' ? 'block' : 'none';
    document.getElementById('menuEditArea').style.display = tabName === 'menu' ? 'block' : 'none';

    if (tabName === 'cards') editorRenderCardList();
    else if (tabName === 'articles') editorRenderArticleList();
    else if (tabName === 'menu') { editorRenderMenuList(); editorRenderMenuEdit(); }
    else if (tabName === 'languages') { editorRenderLanguageList(); }
  });

  // Article sub‑tab switching
  const articleSubTabs = document.getElementById('articleSubTabs');
  articleSubTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.sub-tab');
    if (!tab) return;
    const articleType = tab.getAttribute('data-article');
    if (articleType === window.editorState.currentArticleTab) return;
    window.editorState.currentArticleTab = articleType;
    articleSubTabs.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    editorRenderArticleList();
  });
});