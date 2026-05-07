// js/state.js
// global mutable state, shared across modules
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
};
