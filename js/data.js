// js/data.js
async function loadAllCards() {
  try {
    const resp = await fetch('mainpagecards.json');
    if (!resp.ok) throw new Error('Failed to load mainpagecards.json');
    const json = await resp.json();

    let cardsArray = [];
    if (Array.isArray(json)) {
      cardsArray = json;
    } else if (json && Array.isArray(json.cards)) {
      cardsArray = json.cards;
      if (json.settings && json.settings.landingCardId) {
        state.landingCardId = json.settings.landingCardId;
      }
    } else {
      throw new Error('Invalid JSON structure');
    }

    state.mainCards = cardsArray
      .filter(c => c.column === 'main')
      .sort((a, b) => a.order - b.order);
    state.devlogCards = cardsArray
      .filter(c => c.column === 'devlog')
      .sort((a, b) => a.order - b.order);
    state.blogCards = cardsArray
      .filter(c => c.column === 'blog')
      .sort((a, b) => a.order - b.order);
  } catch (err) {
    console.warn('Could not load cards, using empty arrays.', err);
    state.mainCards = [];
    state.devlogCards = [];
    state.blogCards = [];
  }
}
