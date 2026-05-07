function getCardWidth() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-width').trim());
}

function getCardHeight() {
  return getCardWidth() * 7.2 / 5;
}

function getColumnGap() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--column-gap').trim());
}

function getRowGap() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--row-gap').trim());
}

function getTablePaddingX() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--table-padding-x').trim());
}

function getTablePaddingY() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--table-padding-y').trim());
}

async function buildAllCards() {
  const tableSurface = document.getElementById('tableSurface');
  tableSurface.innerHTML = '';
  state.allCardEls = [];

  const cardW = getCardWidth();
  const cardH = getCardHeight();
  const colGap = getColumnGap();
  const rowGap = getRowGap();
  const padX = getTablePaddingX();
  const padY = getTablePaddingY();

  const devCenterX = padX + cardW / 2;
  const mainCenterX = padX + cardW + colGap + cardW / 2;
  const blogCenterX = padX + 2 * cardW + 2 * colGap + cardW / 2;

  // Devlog column
  state.devlogCards.forEach((data, i) => {
    const el = document.createElement('article');
    el.className = 'devlog-card';
    el.classList.add(data.uiMode || 'opaque');
    if (data.imageUrl && data.videoUrl) {
      el.classList.add('has-both');
    }
    el.innerHTML = createDevlogCardHTML(data);
    el.setAttribute('data-card-id', data.id);
    el.setAttribute('data-column', 'devlog');
    el.setAttribute('data-index', i);
    const cx = devCenterX;
    const cy = padY + cardH / 2 + i * (cardH + rowGap);
    el.style.left = (cx - cardW / 2) + 'px';
    el.style.top = (cy - cardH / 2) + 'px';
    tableSurface.appendChild(el);
    state.allCardEls.push({ el, centerX: cx, centerY: cy, column: 'devlog', index: i, id: data.id });
  });

  // Main column
  state.mainCards.forEach((data, i) => {
    const el = document.createElement('article');
    el.className = 'card';
    el.classList.add(data.uiMode || 'opaque');
    if (data.imageUrl && data.videoUrl) {
      el.classList.add('has-both');
    }
    el.innerHTML = createMainCardHTML(data);
    el.setAttribute('data-card-id', data.id);
    el.setAttribute('data-column', 'main');
    el.setAttribute('data-index', i);
    const cx = mainCenterX;
    const cy = padY + cardH / 2 + i * (cardH + rowGap);
    el.style.left = (cx - cardW / 2) + 'px';
    el.style.top = (cy - cardH / 2) + 'px';
    tableSurface.appendChild(el);
    state.allCardEls.push({ el, centerX: cx, centerY: cy, column: 'main', index: i, id: data.id });
  });

  // Blog column
  state.blogCards.forEach((data, i) => {
    const el = document.createElement('article');
    el.className = 'blog-card';
    el.classList.add(data.uiMode || 'opaque');
    if (data.imageUrl && data.videoUrl) {
      el.classList.add('has-both');
    }
    el.innerHTML = createBlogCardHTML(data);
    el.setAttribute('data-card-id', data.id);
    el.setAttribute('data-column', 'blog');
    el.setAttribute('data-index', i);
    const cx = blogCenterX;
    const cy = padY + cardH / 2 + i * (cardH + rowGap);
    el.style.left = (cx - cardW / 2) + 'px';
    el.style.top = (cy - cardH / 2) + 'px';
    tableSurface.appendChild(el);
    state.allCardEls.push({ el, centerX: cx, centerY: cy, column: 'blog', index: i, id: data.id });
  });

  const totalWidth = padX * 2 + cardW * 3 + colGap * 2;
  const mainColHeight = padY * 2 + state.mainCards.length * cardH + (state.mainCards.length - 1) * rowGap;
  const devlogColHeight = padY * 2 + state.devlogCards.length * cardH + (state.devlogCards.length - 1) * rowGap;
  const blogColHeight = padY * 2 + state.blogCards.length * cardH + (state.blogCards.length - 1) * rowGap;
  tableSurface.style.width = totalWidth + 'px';
  tableSurface.style.height = Math.max(mainColHeight, devlogColHeight, blogColHeight) + 'px';
}

function onResize() {
  const cardW = getCardWidth(), cardH = getCardHeight();
  const colGap = getColumnGap(), rowGap = getRowGap();
  const padX = getTablePaddingX(), padY = getTablePaddingY();
  const devCenterX = padX + cardW / 2;
  const mainCenterX = padX + cardW + colGap + cardW / 2;
  const blogCenterX = padX + 2 * cardW + 2 * colGap + cardW / 2;

  state.allCardEls.forEach(card => {
    let cx;
    if (card.column === 'devlog') cx = devCenterX;
    else if (card.column === 'main') cx = mainCenterX;
    else cx = blogCenterX;
    const cy = padY + cardH / 2 + card.index * (cardH + rowGap);
    card.centerX = cx;
    card.centerY = cy;
    card.el.style.left = (cx - cardW / 2) + 'px';
    card.el.style.top = (cy - cardH / 2) + 'px';
  });

  const totalWidth = padX * 2 + cardW * 3 + colGap * 2;
  const mainColHeight = padY * 2 + state.mainCards.length * cardH + (state.mainCards.length - 1) * rowGap;
  const devlogColHeight = padY * 2 + state.devlogCards.length * cardH + (state.devlogCards.length - 1) * rowGap;
  const blogColHeight = padY * 2 + state.blogCards.length * cardH + (state.blogCards.length - 1) * rowGap;
  const tableSurface = document.getElementById('tableSurface');
  tableSurface.style.width = totalWidth + 'px';
  tableSurface.style.height = Math.max(mainColHeight, devlogColHeight, blogColHeight) + 'px';

  if (state.currentCardIndex >= 0 && state.currentCardIndex < state.allCardEls.length) {
    snapToCard(state.currentCardIndex, false);
  }
}
