// Shared editor state – attached to window so all modules can access it

window.editorData = {
  settings: {
    landingCardId: "",
    defaultLanguage: "en",
    languages: ["en"],
    siteTitle: { "en": "Life Snake Studio" }
  },
  menu: [],
  cards: []
};

window.editorState = {
  currentColumn: "main",
  currentLang: "en",
  currentMainTab: "cards"   // "cards" | "menu" | "languages"
};
