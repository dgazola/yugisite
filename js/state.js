const state = {
  allCardEls: [],
  currentCardIndex: 0,
  tableTx: 0,
  tableTy: 0,
  isDragging: false,
  isSnapping: false,
  pointerStartX: 0,
  pointerStartY: 0,
  tableStartTx: 0,
  tableStartTy: 0,
  pointerMoved: false,
  currentSnapOnEnd: null,
  wheelSnapTimeout: null,
  mainCards: [],
  devlogCards: [],
  blogCards: [],
  landingCardId: "home",
  currentLanguage: "en",
  rawCards: [],
  settings: {
    defaultLanguage: "en",
    languages: ["en"],
    siteTitle: { en: "Life Snake Studio" }
  },
  menuItems: []   // { id: "home", translations: { en: "Home", pt: "Início" } }
};
