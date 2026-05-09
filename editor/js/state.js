window.editorData = {
  settings: {
    landingCardId: "",
    defaultLanguage: "en",
    languages: ["en"],
    siteTitle: { "en": "Life Snake Studio" }
  },
  menu: [],
  cards: []        // main cards only
};

// Articles data – separate from main data
window.blogArticles = [];
window.devlogArticles = [];

window.editorState = {
  currentMainTab: "cards",        // "cards" | "articles" | "menu" | "languages"
  currentArticleTab: "blog",      // "blog" | "devlog"
  currentLang: "en"
};