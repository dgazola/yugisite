// Main tab switching and article sub‑tab switching.

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
    document.getElementById('panelLanguages').style.display = tabName === 'languages' ? 'block' : 'none';

    document.getElementById('cardListPanel').style.display = tabName === 'cards' ? 'flex' : 'none';
    document.getElementById('articleListPanel').style.display = tabName === 'articles' ? 'flex' : 'none';
    document.getElementById('langListPanel').style.display = tabName === 'languages' ? 'flex' : 'none';

    if (tabName === 'cards') {
      editorRenderCardList();
    } else if (tabName === 'articles') {
      editorRenderArticleList();
    } else if (tabName === 'languages') {
      editorRenderLanguageList();
    }
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