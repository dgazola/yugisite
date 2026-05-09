(async function() {
  const params = new URLSearchParams(location.search);
  const type = params.get('type') || 'blog';         // blog / devlog
  const initialId = params.get('id') || null;

  // Language setup (same as main page)
  let currentLang = 'en';
  let languages = ['en'];
  let settings = { defaultLanguage: 'en', languages };
  let articles = [];

  // Fetch the article file
  async function loadArticles() {
    try {
      const resp = await fetch(`../Content/${type}-posts.json`);
      if (!resp.ok) throw new Error('File not found');
      const json = await resp.json();
      articles = json;
      // Fill languages from main page settings? We'll hardcode for now, or fetch mainpagecards.json
      try {
        const mainResp = await fetch('../Content/mainpagecards.json');
        if (mainResp.ok) {
          const mainJson = await mainResp.json();
          if (mainJson.settings && mainJson.settings.languages) {
            languages = mainJson.settings.languages;
            settings = mainJson.settings;
          }
        }
      } catch (e) {}
    } catch (err) {
      console.warn(err);
      articles = [];
    }
  }

  function renderCardList() {
    const sidebar = document.getElementById('articleSidebar');
    sidebar.innerHTML = '';
    articles.forEach(article => {
      const t = article.translations[currentLang] || article.translations[settings.defaultLanguage] || {};
      const cardEl = document.createElement('div');
      cardEl.className = 'article-card';
      if (article.id === initialId) cardEl.classList.add('selected');
      cardEl.dataset.id = article.id;
      cardEl.innerHTML = `
        <div class="card-art" style="background:var(--card-art-bg);">
          ${article.imageUrl ? `<img src="${article.imageUrl}" alt="" />` : ''}
          ${article.videoUrl ? `<video src="${article.videoUrl}" muted loop playsinline></video>` : ''}
          <div class="art-title"><h2>${t.title || ''}</h2></div>
        </div>`;
      cardEl.addEventListener('click', () => selectArticle(article.id));
      sidebar.appendChild(cardEl);
    });
    if (articles.length === 0) {
      sidebar.innerHTML = '<p style="color:#5c5430;">No articles found.</p>';
    }
  }

  function selectArticle(id) {
    document.querySelectorAll('.article-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.article-card[data-id="${id}"]`);
    if (card) card.classList.add('selected');

    const article = articles.find(a => a.id === id);
    if (!article) return;
    const t = article.translations[currentLang] || article.translations[settings.defaultLanguage] || {};
    document.getElementById('detailTitle').textContent = t.articleTitle || t.title || '';
    document.getElementById('detailBody').textContent = t.articleBody || '';
  }

  function buildLanguageSelector() {
    const sel = document.getElementById('langSelect');
    sel.innerHTML = '';
    languages.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = lang.toUpperCase();
      sel.appendChild(opt);
    });
    sel.value = currentLang;
    sel.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('preferredLanguage', currentLang);
      renderCardList();
      if (articles.length > 0) selectArticle(articles[0].id); // or keep current
    });
  }

  // Init
  await loadArticles();
  buildLanguageSelector();
  renderCardList();
  if (initialId && articles.some(a => a.id === initialId)) {
    selectArticle(initialId);
  } else if (articles.length > 0) {
    selectArticle(articles[0].id);
  }
})();