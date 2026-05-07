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

async function switchLanguage(lang) {
  const currentCard = state.allCardEls[state.currentCardIndex];
  const restoreId = currentCard ? currentCard.id : null;

  applyLanguage(lang);
  await buildAllCards();

  let newIndex = state.allCardEls.findIndex(c => c.id === restoreId);
  if (newIndex < 0) {
    newIndex = state.allCardEls.findIndex(c => c.id === state.landingCardId);
    if (newIndex < 0 && state.allCardEls.length > 0) newIndex = 0;
  }
  updateCurrentCard(newIndex);
  snapToCard(newIndex, false);
  updateCardOpacities();

  localStorage.setItem('preferredLanguage', lang);
  document.getElementById('langSelect').value = lang;
}

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('resize', debounce(onResize, 200));

  const langSelect = document.getElementById('langSelect');
  langSelect.addEventListener('change', (e) => {
    switchLanguage(e.target.value);
  });

  init().then(() => {
    console.log('🃏 Life Snake Studio – v0.2.0 | Multi‑language with dynamic menu');
  });
});

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
