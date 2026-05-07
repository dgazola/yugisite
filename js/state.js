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
  settings: {},
  menuItems: [],

  // Axis lock
  dominantAxis: null,           // 'x' | 'y' | null
  initialPointerX: 0,          // pointer position at drag start (or after last axis switch)
  initialPointerY: 0,
  initialTableTx: 0,           // table position at start of current lock
  initialTableTy: 0,
};
