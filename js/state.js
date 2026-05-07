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
  dragLockedAxis: null,          // 'x' | 'y' | null
  lockStartX: 0,                // pointer position when current lock started
  lockStartY: 0,
  lockStartTx: 0,               // table position when lock started
  lockStartTy: 0,
};
