// js/app.js
// Main initialization and global API
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function init() {
  await loadAllCards();
  await buildAllCards();

  let startIndex = state.allCardEls.findIndex(c => c.id === state.landingCardId);
  if (startIndex < 0) {
    startIndex = state.allCardEls.findIndex(c => c.id === 'home');
    if (startIndex < 0 && state.allCardEls.length > 0) startIndex = 0;
  }
  updateCurrentCard(startIndex);
  snapToCard(startIndex, false);
  updateCardOpacities();
}

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('resize', debounce(onResize, 200));
  init().then(() => {
    console.log('🃏 Life Snake Studio – v0.2.0 | Modular architecture');
  });
});

// public API (optional)
window.lifeSnakeStudio = {
  navigateTo: function(cardId) {
    const idx = state.allCardEls.findIndex(c => c.id === cardId);
    if (idx >= 0) snapToCard(idx, true);
  },
  navigateToBlog: function(blogIndex) {
    const idx = state.allCardEls.findIndex(c => c.column === 'blog' && c.index === blogIndex);
    if (idx >= 0) snapToCard(idx, true);
  },
  navigateToDevlog: function(devlogIndex) {
    const idx = state.allCardEls.findIndex(c => c.column === 'devlog' && c.index === devlogIndex);
    if (idx >= 0) snapToCard(idx, true);
  },
  getCurrentCard: function() {
    return state.allCardEls[state.currentCardIndex] || null;
  },
  getAllCards: function() {
    return state.allCardEls;
  },
};
