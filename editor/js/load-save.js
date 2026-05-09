// ── Process loaded JSON (internal; used by auto‑load and revert) ──
function editorProcessMainJson(json) {
  if (Array.isArray(json)) {
    window.editorData.cards = json.map(c => editorMigrateOldCard(c));
    window.editorData.settings = {
      landingCardId: "",
      defaultLanguage: "en",
      languages: ["en"],
      siteTitle: { "en": "Life Snake Studio" }
    };
    window.editorData.menu = [];
  } else {
    window.editorData.cards = (json.cards || []).map(c => {
      if (!c.translations) return editorMigrateOldCard(c);
      return c;
    });
    window.editorData.settings = json.settings || {};
    window.editorData.menu = json.menu || [];
    if (!window.editorData.settings.defaultLanguage) window.editorData.settings.defaultLanguage = "en";
    if (!window.editorData.settings.languages) window.editorData.settings.languages = ["en"];
    if (!window.editorData.settings.siteTitle) window.editorData.settings.siteTitle = { "en": "Life Snake Studio" };

    // ensure link is at card level
    window.editorData.cards.forEach(card => {
      card.translations = editorEnsureTranslations(card.translations, window.editorData.settings.languages);
      window.editorData.settings.languages.forEach(lang => {
        if (!card.translations[lang]) card.translations[lang] = {};
        if (card.translations[lang].link === undefined) card.translations[lang].link = "";
      });
      if (card.link === undefined) {
        const firstTrans = Object.values(card.translations)[0];
        card.link = (firstTrans && firstTrans.link) || "";
      }
    });
    window.editorData.menu.forEach(item => {
      item.translations = editorEnsureTranslations(item.translations, window.editorData.settings.languages);
    });
  }
  // re‑render current tab (usually cards, but we might be called from revert while on another tab)
  if (window.editorState.currentMainTab === "cards") {
    editorReorderAll();
    editorRefreshLandingSelect();
    editorRenderCardList();
  } else if (window.editorState.currentMainTab === "menu") {
    editorRenderMenuList();
    editorRenderMenuEdit();
  }
}

function editorProcessArticleJson(json, articleType) {
  const arr = json.map(c => {
    if (!c.translations) {
      const migrated = editorMigrateOldCard(c);
      migrated.isHighlighted = c.isHighlighted || false;
      migrated.articleTitle = c.articleTitle || "";
      migrated.articleBody = c.articleBody || "";
      return migrated;
    }
    window.editorData.settings.languages.forEach(lang => {
      if (c.translations[lang]) {
        c.translations[lang].articleTitle = c.translations[lang].articleTitle || "";
        c.translations[lang].articleBody = c.translations[lang].articleBody || "";
      }
    });
    c.isHighlighted = c.isHighlighted || false;
    return c;
  });

  if (articleType === "blog") window.blogArticles = arr;
  else window.devlogArticles = arr;

  // refresh articles view
  if (window.editorState.currentMainTab === "articles" && window.editorState.currentArticleTab === articleType) {
    editorRenderArticleList();
  }
}

// ── Save (download) current file ──────────────────────
function editorSave() {
  const tab = window.editorState.currentMainTab;
  if (tab === "articles") {
    saveArticleJson();
  } else {
    saveMainJson();
  }
}

function saveMainJson() {
  editorReorderAll();
  window.editorData.cards.forEach(c => { if (!c.id) c.id = editorGenerateId(); });
  if (window.editorData.settings.landingCardId && !window.editorData.cards.find(c => c.id === window.editorData.settings.landingCardId))
    window.editorData.settings.landingCardId = "";
  // Clean up link from translations (it's stored at card level)
  window.editorData.cards.forEach(card => {
    if (card.link === undefined) {
      const anyTrans = Object.values(card.translations)[0];
      card.link = (anyTrans && anyTrans.link) || "";
    }
    Object.keys(card.translations).forEach(lang => {
      if (card.translations[lang]) delete card.translations[lang].link;
    });
  });
  const mainData = {
    settings: window.editorData.settings,
    menu: window.editorData.menu,
    cards: window.editorData.cards
  };
  downloadJson(mainData, "mainpagecards.json");
}

function saveArticleJson() {
  const articleType = window.editorState.currentArticleTab;
  const arr = articleType === "blog" ? window.blogArticles : window.devlogArticles;
  arr.forEach(a => { if (!a.id) a.id = editorGenerateId(); });
  editorReorderArticles();
  downloadJson(arr, `${articleType}-posts.json`);
}

function downloadJson(dataObj, filename) {
  const json = JSON.stringify(dataObj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Revert (reload) current file from server ──────────
async function editorRevert() {
  if (!confirm(`Revert all changes to the current file?`)) return;

  if (window.editorState.currentMainTab === "articles") {
    const articleType = window.editorState.currentArticleTab;
    try {
      const resp = await fetch(`../Content/${articleType}-posts.json`);
      if (!resp.ok) throw new Error(`Failed to load ${articleType}-posts.json`);
      const json = await resp.json();
      editorProcessArticleJson(json, articleType);
      // also update the main page data? No, revert only the article file.
    } catch (err) {
      alert("Revert failed: " + err.message);
    }
  } else {
    try {
      const resp = await fetch('../Content/mainpagecards.json');
      if (!resp.ok) throw new Error('Failed to load mainpagecards.json');
      const json = await resp.json();
      editorProcessMainJson(json);
    } catch (err) {
      alert("Revert failed: " + err.message);
    }
  }
}