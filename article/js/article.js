(async function() {
  const params = new URLSearchParams(location.search);
  const type = params.get('type') || 'blog';
  const initialId = params.get('id') || null;

  let currentLang = 'en';
  let languages = ['en'];
  let settings = { defaultLanguage: 'en', languages };
  let articles = [];
  let menuItems = [];

  // ── Fetch article file ─────────────────────────────────
  async function loadArticles() {
    const file = type === 'blog' ? 'blog-posts.json' : 'devlogs-posts.json';
    try {
      const resp = await fetch(`../Content/${file}`);
      if (!resp.ok) throw new Error('File not found');
      articles = (await resp.json()).map(c => {
        if (!c.translations) {
          return {
            ...c,
            translations: { en: { name: c.name||"", sub: c.sub||"", label: c.label||"", title: c.title||"", description: c.description||"", meta: c.meta||"", tag: c.tag||"", articleTitle: c.articleTitle||"", articleBody: c.articleBody||"" } }
          };
        }
        return c;
      });
    } catch (err) {
      console.warn(err);
      articles = [];
    }
  }

  // ── Load site settings + menu from main page data ─────
  async function loadSiteSettings() {
    try {
      const mainResp = await fetch('../Content/mainpagecards.json');
      if (!mainResp.ok) throw new Error('Failed to load main settings');
      const mainJson = await mainResp.json();
      settings = mainJson.settings || { defaultLanguage: "en", languages: ["en"] };
      languages = settings.languages || ["en"];
      menuItems = mainJson.menu || [];
    } catch (err) {
      console.warn('Site settings / menu not loaded', err);
    }
  }

  // ── Hamburger menu toggle ─────────────────────────────
  function toggleMenu() {
    document.getElementById('menu').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
  }

  document.getElementById('menuTrigger').addEventListener('click', toggleMenu);
  document.getElementById('overlay').addEventListener('click', toggleMenu);

  // ── Build menu links (navigate to main page + snap) ────
  function buildMenu() {
    const container = document.getElementById('menuLinks');
    if (!container) return;
    container.innerHTML = '';
    menuItems.forEach(item => {
      const label = item.translations[currentLang] || item.translations[settings.defaultLanguage] || item.id;
      const a = document.createElement('a');
      a.href = `index.html?snap=${item.id}`;
      a.textContent = label;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = a.href;
      });
      container.appendChild(a);
    });
  }

  // ── Language selector ─────────────────────────────────
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
      if (articles.length > 0) selectArticle(articles[0].id);
      buildMenu();
    });
  }

  // ── Card list in sidebar ──────────────────────────────
  function renderCardList() {
    const sidebar = document.getElementById('articleSidebar');
    sidebar.innerHTML = '';
    articles.forEach((article, idx) => {
      const t = article.translations[currentLang] || article.translations[settings.defaultLanguage] || {};

      // Build a data object suitable for the existing card HTML generators
      const cardData = {
        column: article.column || type,
        id: article.id,
        uiMode: article.uiMode || 'opaque',
        imageUrl: article.imageUrl,
        videoUrl: article.videoUrl,
        color: article.color,
        title: t.title || '',
        description: t.description || '',
        label: t.label || '',
        meta: t.meta || '',
        tag: t.tag || '',
        name: t.name || '',
        sub: t.sub || ''
      };

      const cardEl = document.createElement('article');
      cardEl.className = (type === 'blog' ? 'blog-card' : 'devlog-card') + ' article-card';
      cardEl.classList.add(cardData.uiMode);
      if (cardData.imageUrl && cardData.videoUrl) {
        cardEl.classList.add('has-both');
      }
      if (cardData.color) {
        cardEl.style.setProperty('--card-accent', cardData.color);
      }
      // Use the existing generator; note: blog‑card and devlog‑card HTML have slightly different structures,
      // but since we styled them both with the same rules they will look identical.
      cardEl.innerHTML = (type === 'blog' ? createBlogCardHTML : createDevlogCardHTML)(cardData);  

      if (article.id === initialId) cardEl.classList.add('selected');
      cardEl.dataset.id = article.id;
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
    if (card) {
      card.classList.add('selected');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    const article = articles.find(a => a.id === id);
    if (!article) return;
    const t = article.translations[currentLang] || article.translations[settings.defaultLanguage] || {};
    document.getElementById('detailTitle').textContent = t.articleTitle || t.title || '';
    document.getElementById('detailBody').textContent = t.articleBody || '';
  }

  // ── Init ─────────────────────────────────────────────
  await loadSiteSettings();
  await loadArticles();

  // Apply site‑wide accent colour from constants
  document.documentElement.style.setProperty('--site-accent', SITE_ACCENT_COLOR);

  const urlLang = params.get('lang') || localStorage.getItem('preferredLanguage') || (navigator.language || '').substring(0,2);
  if (languages.includes(urlLang)) currentLang = urlLang;
  else currentLang = settings.defaultLanguage || 'en';

  buildLanguageSelector();
  buildMenu();
  renderCardList();

  if (initialId && articles.some(a => a.id === initialId)) {
    selectArticle(initialId);
  } else if (articles.length > 0) {
    selectArticle(articles[0].id);
  }
})();