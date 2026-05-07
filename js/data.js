async function loadAllCards() {
  try {
    const resp = await fetch('mainpagecards.json');
    if (!resp.ok) throw new Error('Failed to load mainpagecards.json');
    const json = await resp.json();

    let cardsArray = [];
    let settings = {};

    if (Array.isArray(json)) {
      // Old format – migrate
      cardsArray = json.map(c => migrateCard(c));
      settings = { defaultLanguage: "en", languages: ["en"] };
    } else if (json && Array.isArray(json.cards)) {
      cardsArray = json.cards.map(c => {
        // Ensure each card has translations
        if (!c.translations) {
          return migrateCard(c);
        }
        return c;
      });
      settings = json.settings || {};
      if (!settings.defaultLanguage) settings.defaultLanguage = "en";
      if (!settings.languages) settings.languages = ["en"];
    } else {
      throw new Error('Invalid JSON structure');
    }

    state.settings = settings;
    // Store raw cards for later language switches
    state.rawCards = cardsArray;

    // Determine initial language
    const urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang') ||
               localStorage.getItem('preferredLanguage') ||
               (navigator.language || navigator.userLanguage || '').substring(0, 2);
    if (!settings.languages.includes(lang)) {
      lang = settings.defaultLanguage || 'en';
    }
    state.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);

    // Build localised card arrays
    applyLanguage(lang);

  } catch (err) {
    console.warn('Could not load cards, using empty arrays.', err);
    state.mainCards = [];
    state.devlogCards = [];
    state.blogCards = [];
    state.rawCards = [];
    state.settings = { defaultLanguage: "en", languages: ["en"] };
  }

  // Update language selector UI
  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = state.currentLanguage;
}

// Migrate old flat card to new translation structure
function migrateCard(card) {
  return {
    column: card.column || "main",
    order: card.order || 0,
    type: card.type || card.column || "main",
    id: card.id || "",
    translations: {
      en: {
        name: card.name || "",
        sub: card.sub || "",
        label: card.label || "",
        title: card.title || "",
        description: card.description || "",
        meta: card.meta || "",
        tag: card.tag || ""
      }
    }
  };
}

// Apply a language: re‑build main/devlog/blog arrays from rawCards
function applyLanguage(lang) {
  state.currentLanguage = lang;
  const defaultLang = state.settings.defaultLanguage || 'en';

  function localise(card) {
    const trans = card.translations && card.translations[lang]
      ? card.translations[lang]
      : (card.translations && card.translations[defaultLang] ? card.translations[defaultLang] : null);
    return {
      ...card,
      name: trans?.name || '',
      sub: trans?.sub || '',
      label: trans?.label || '',
      title: trans?.title || '',
      description: trans?.description || '',
      meta: trans?.meta || '',
      tag: trans?.tag || ''
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
}
