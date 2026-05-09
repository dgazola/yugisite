async function loadAllCards() {
  try {
    // 1. Load main page data
    const mainResp = await fetch('Content/mainpagecards.json');
    if (!mainResp.ok) throw new Error('Failed to load mainpagecards.json');
    const mainJson = await mainResp.json();

    let mainCardsArray = [];
    let settings = {};
    let menuItems = [];

    if (Array.isArray(mainJson)) {
      mainCardsArray = mainJson.map(c => migrateCard(c));
      settings = { defaultLanguage: "en", languages: ["en"] };
      menuItems = [];
    } else if (mainJson && Array.isArray(mainJson.cards)) {
      mainCardsArray = mainJson.cards.map(c => {
        if (!c.translations) return migrateCard(c);
        return c;
      });
      settings = mainJson.settings || {};
      if (!settings.defaultLanguage) settings.defaultLanguage = "en";
      if (!settings.languages) settings.languages = ["en"];
      if (!settings.siteTitle) settings.siteTitle = { en: "Life Snake Studio" };

      menuItems = mainJson.menu || [];
      menuItems.forEach(item => {
        if (!item.translations) item.translations = {};
        settings.languages.forEach(lang => {
          if (!item.translations[lang]) item.translations[lang] = item.id;
        });
      });
      if (menuItems.length === 0) {
        menuItems = generateDefaultMenu(mainCardsArray, settings.languages);
      }
    } else {
      throw new Error('Invalid JSON structure for main page');
    }

    state.settings = settings;
    state.menuItems = menuItems;

    // Store raw main cards
    state.rawCards = mainCardsArray;

    // 2. Load blog posts (highlighted)
    let blogCards = [];
    try {
      const blogResp = await fetch('Content/blog-posts.json');
      if (blogResp.ok) {
        const blogJson = await blogResp.json();
        blogCards = blogJson
          .filter(c => c.isHighlighted)
          .map(c => {
            if (!c.translations) return migrateCard(c);
            c.column = 'blog';
            return c;
          })
          .sort((a, b) => a.order - b.order);
      }
    } catch (err) {
      console.warn('Could not load blog-posts.json', err);
    }

    // 3. Load devlogs (highlighted)
    let devlogCards = [];
    try {
      const devlogResp = await fetch('Content/devlogs-posts.json');
      if (devlogResp.ok) {
        const devlogJson = await devlogResp.json();
        devlogCards = devlogJson
          .filter(c => c.isHighlighted)
          .map(c => {
            if (!c.translations) return migrateCard(c);
            c.column = 'devlog';
            return c;
          })
          .sort((a, b) => a.order - b.order);
      }
    } catch (err) {
      console.warn('Could not load devlogs-posts.json', err);
    }

    state.rawCards = mainCardsArray.concat(blogCards, devlogCards);

    const urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang') ||
               localStorage.getItem('preferredLanguage') ||
               (navigator.language || navigator.userLanguage || '').substring(0, 2);
    if (!settings.languages.includes(lang)) {
      lang = settings.defaultLanguage || 'en';
    }
    state.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);

    applyLanguage(lang);

  } catch (err) {
    console.warn('Could not load cards, using empty arrays.', err);
    state.mainCards = [];
    state.devlogCards = [];
    state.blogCards = [];
    state.rawCards = [];
    state.menuItems = [];
    state.settings = { defaultLanguage: "en", languages: ["en"], siteTitle: { en: "Life Snake Studio" } };
  }

  buildMenuHTML();
  populateLanguageSelector();
  updateSiteTitle();
  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = state.currentLanguage;
}

function migrateCard(card) {
  return {
    column: card.column || "main",
    order: card.order || 0,
    type: card.type || card.column || "main",
    id: card.id || "",
    uiMode: card.uiMode || 'opaque',
    imageUrl: card.imageUrl || null,
    videoUrl: card.videoUrl || null,
    translations: {
      en: {
        name: card.name || "",
        sub: card.sub || "",
        label: card.label || "",
        title: card.title || "",
        description: card.description || "",
        meta: card.meta || "",
        tag: card.tag || "",
        link: card.link || ""
      }
    }
  };
}

function applyLanguage(lang) {
  state.currentLanguage = lang;
  const defaultLang = state.settings.defaultLanguage || 'en';

  function localise(card) {
    const trans = card.translations && card.translations[lang]
      ? card.translations[lang]
      : (card.translations && card.translations[defaultLang] ? card.translations[defaultLang] : null);
    return {
      ...card,
      uiMode: card.uiMode || 'opaque',
      imageUrl: card.imageUrl || null,
      videoUrl: card.videoUrl || null,
      name: trans?.name || '',
      sub: trans?.sub || '',
      label: trans?.label || '',
      title: trans?.title || '',
      description: trans?.description || '',
      meta: trans?.meta || '',
      tag: trans?.tag || '',
      link: trans?.link || ''
    };
  }

  state.mainCards = state.rawCards
    .filter(c => c.column === 'main')
    .sort((a, b) => a.order - b.order)
    .map(localise);
  state.devlogCards = state.rawCards
    .filter(c => c.column === 'devlog')
    .sort((a, b) => a.order - b.order)
    .map(localise);
  state.blogCards = state.rawCards
    .filter(c => c.column === 'blog')
    .sort((a, b) => a.order - b.order)
    .map(localise);

  buildMenuHTML();
  updateSiteTitle();
}

function generateDefaultMenu(cards, languages) {
  const knownOrder = ['home','world','tcg','engine','licensing','community','contact','presskit','devlog-0','blog-0'];
  const menu = [];
  knownOrder.forEach(id => {
    const card = cards.find(c => c.id === id);
    if (card) {
      const entry = { id, translations: {} };
      languages.forEach(lang => {
        const trans = card.translations && card.translations[lang]
          ? card.translations[lang]
          : (card.translations && card.translations.en ? card.translations.en : {});
        entry.translations[lang] = trans.name || trans.title || id;
      });
      menu.push(entry);
    }
  });
  return menu;
}

function buildMenuHTML() {
  const container = document.getElementById('menuLinks');
  if (!container) return;
  container.innerHTML = '';
  state.menuItems.forEach(item => {
    const label = item.translations[state.currentLanguage] ||
                  item.translations[state.settings.defaultLanguage] ||
                  item.id;
    const a = document.createElement('a');
    a.setAttribute('data-nav', item.id);
    a.textContent = label;
    container.appendChild(a);
  });
  attachMenuEvents();
}

function updateSiteTitle() {
  const el = document.getElementById('siteTitle');
  if (!el) return;
  const titleObj = state.settings.siteTitle;
  if (titleObj && typeof titleObj === 'object') {
    el.textContent = titleObj[state.currentLanguage] || titleObj[state.settings.defaultLanguage] || 'Life Snake Studio';
  } else {
    el.textContent = 'Life Snake Studio';
  }
}

function populateLanguageSelector() {
  const sel = document.getElementById('langSelect');
  if (!sel) return;
  sel.innerHTML = '';
  (state.settings.languages || ['en']).forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang.toUpperCase();
    sel.appendChild(opt);
  });
}