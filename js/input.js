function getEventPos(e) {
  return { x: e.clientX, y: e.clientY };
}

function findCardAtPoint(clientX, clientY) {
  const viewport = document.getElementById('viewport');
  const vpRect = viewport.getBoundingClientRect();
  const tableX = clientX - vpRect.left - state.tableTx;
  const tableY = clientY - vpRect.top - state.tableTy;
  const cardW = getCardWidth();
  const cardH = getCardHeight();

  for (let i = 0; i < state.allCardEls.length; i++) {
    const card = state.allCardEls[i];
    const left = parseFloat(card.el.style.left);
    const top = parseFloat(card.el.style.top);
    if (tableX >= left && tableX <= left + cardW && tableY >= top && tableY <= top + cardH) {
      return i;
    }
  }
  return -1;
}

// ── HELPERS ─────────────────────────────────────────────
function getColumnCenter(column) {
  const padX = getTablePaddingX();
  const cardW = getCardWidth();
  const colGap = getColumnGap();
  if (column === 'devlog') return padX + cardW / 2;
  if (column === 'blog')   return padX + 2 * cardW + 2 * colGap + cardW / 2;
  return padX + cardW + colGap + cardW / 2; // main
}

// Snap to the nearest card in the same column (vertical lock)
function snapToNearestInColumn() {
  const viewport = document.getElementById('viewport');
  const vpH = viewport.clientHeight;
  const targetY = vpH / 2 - state.tableTy;   // world Y we should be looking at

  const columnCards = state.allCardEls.filter(c => c.el.getAttribute('data-column') === state.dragStartCard.column);
  if (columnCards.length === 0) return;

  let best = null;
  let bestDist = Infinity;
  columnCards.forEach(card => {
    const dist = Math.abs(card.centerY - targetY);
    if (dist < bestDist) {
      bestDist = dist;
      best = card;
    }
  });
  if (best) {
    const idx = state.allCardEls.indexOf(best);
    if (idx >= 0) snapToCard(idx, true);
  }
}

// Snap to the nearest card in the same row (horizontal lock)
function snapToNearestInRow() {
  const viewport = document.getElementById('viewport');
  const vpW = viewport.clientWidth;
  const targetX = vpW / 2 - state.tableTx;   // world X we should be looking at
  const rowY = state.dragStartCard.centerY;   // fixed row Y

  const rowTolerance = ROW_TOLERANCE + getRowGap() / 2;
  const candidates = state.allCardEls.filter(card => {
    return Math.abs(card.centerY - rowY) <= rowTolerance;
  });

  if (candidates.length === 0) return;

  let best = null;
  let bestDist = Infinity;
  candidates.forEach(card => {
    const dist = Math.abs(card.centerX - targetX);
    if (dist < bestDist) {
      bestDist = dist;
      best = card;
    }
  });

  if (best) {
    const idx = state.allCardEls.indexOf(best);
    if (idx >= 0) snapToCard(idx, true);
  }
}

// ── POINTER HANDLERS ────────────────────────────────────
function onPointerDown(e) {
  const menu = document.getElementById('menu');
  if (menu.classList.contains('active')) return;
  if (e.target.closest('.topbar') && !e.target.closest('.viewport')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();

  const viewport = document.getElementById('viewport');
  viewport.setPointerCapture(e.pointerId);

  const pos = getEventPos(e);
  state.pointerStartX = pos.x;
  state.pointerStartY = pos.y;
  state.tableStartTx = state.tableTx;
  state.tableStartTy = state.tableTy;
  state.pointerMoved = false;
  state.isDragging = true;
  state.isSnapping = false;

  // Remember which card we're on
  state.dragStartCard = state.allCardEls[state.currentCardIndex] || null;
  if (state.dragStartCard) {
    state.columnCenterX = getColumnCenter(state.dragStartCard.column);
  }

  // Reset axis lock
  state.dragLockedAxis = null;
  state.lockStartX = pos.x;
  state.lockStartY = pos.y;
  state.lockStartTx = state.tableTx;
  state.lockStartTy = state.tableTy;

  clearSnapTransition();
  const tableSurface = document.getElementById('tableSurface');
  tableSurface.style.transition = 'none';
  viewport.classList.add('grabbing');
  tableSurface.classList.add('dragging');

  if (state.wheelSnapTimeout) {
    clearTimeout(state.wheelSnapTimeout);
    state.wheelSnapTimeout = null;
  }
}

function onPointerMove(e) {
  if (!state.isDragging) return;
  e.preventDefault();

  const pos = getEventPos(e);
  const dx = pos.x - state.pointerStartX;
  const dy = pos.y - state.pointerStartY;
  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
    state.pointerMoved = true;
  }

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Axis lock decision
  if (!state.dragLockedAxis) {
    if (absDx > AXIS_LOCK_MIN && absDx > absDy + AXIS_LOCK_MIN) {
      state.dragLockedAxis = 'x';
      state.lockStartX = pos.x;
      state.lockStartY = pos.y;
      state.lockStartTx = state.tableTx;
      state.lockStartTy = state.tableTy;
    } else if (absDy > AXIS_LOCK_MIN && absDy > absDx + AXIS_LOCK_MIN) {
      state.dragLockedAxis = 'y';
      state.lockStartX = pos.x;
      state.lockStartY = pos.y;
      state.lockStartTx = state.tableTx;
      state.lockStartTy = state.tableTy;
    } else {
      // Not enough movement to lock yet – free move (but only small, won't matter)
      setTableTransform(state.tableStartTx + dx, state.tableStartTy + dy);
    }
    return;
  }

  // Axis switch check
  const lockDx = pos.x - state.lockStartX;
  const lockDy = pos.y - state.lockStartY;

  if (state.dragLockedAxis === 'x' && Math.abs(lockDy) > AXIS_SWITCH_THRESHOLD) {
    // Switch to vertical
    state.dragLockedAxis = 'y';
    state.lockStartX = pos.x;
    state.lockStartY = pos.y;
    state.lockStartTx = state.tableTx;
    state.lockStartTy = state.tableTy;
    return; // no movement this frame
  }
  if (state.dragLockedAxis === 'y' && Math.abs(lockDx) > AXIS_SWITCH_THRESHOLD) {
    // Switch to horizontal
    state.dragLockedAxis = 'x';
    state.lockStartX = pos.x;
    state.lockStartY = pos.y;
    state.lockStartTx = state.tableTx;
    state.lockStartTy = state.tableTy;
    return;
  }

  // ── Grid‑locked movement ─────────────────────────────
  const viewport = document.getElementById('viewport');
  const vpW = viewport.clientWidth;
  const vpH = viewport.clientHeight;

  if (state.dragLockedAxis === 'y' && state.dragStartCard) {
    // Lock horizontal to current column center
    const newTx = vpW / 2 - state.columnCenterX;
    const newTy = state.lockStartTy + lockDy;
    setTableTransform(newTx, newTy);
  } else if (state.dragLockedAxis === 'x' && state.dragStartCard) {
    // Lock vertical to current row (startCard.centerY)
    const rowY = state.dragStartCard.centerY;
    const newTy = vpH / 2 - rowY;
    const newTx = state.lockStartTx + lockDx;
    setTableTransform(newTx, newTy);
  } else {
    // Fallback (no start card) – free movement
    const newTx = state.lockStartTx + lockDx;
    const newTy = state.lockStartTy + lockDy;
    setTableTransform(newTx, newTy);
  }
}

function onPointerUp(e) {
  if (!state.isDragging) return;
  state.isDragging = false;

  const viewport = document.getElementById('viewport');
  const tableSurface = document.getElementById('tableSurface');
  viewport.classList.remove('grabbing');
  tableSurface.classList.remove('dragging');
  viewport.releasePointerCapture(e.pointerId);

  // If the user didn't really move, treat as a tap
  if (!state.pointerMoved) {
    const pos = getEventPos(e);
    const clickedIndex = findCardAtPoint(pos.x, pos.y);
    if (clickedIndex !== -1) {
      snapToCard(clickedIndex, true);
      state.dragLockedAxis = null;
      state.dragStartCard = null;
      return;
    }
  }

  // Snap based on locked axis
  if (state.dragLockedAxis === 'y') {
    snapToNearestInColumn();
  } else if (state.dragLockedAxis === 'x') {
    snapToNearestInRow();
  } else {
    // No axis lock – fallback to free snap
    const pos = getEventPos(e);
    const dragDx = pos.x - state.pointerStartX;
    const dragDy = pos.y - state.pointerStartY;
    snapToCard(findClosestCardIndex(dragDx, dragDy), true);
  }

  state.dragLockedAxis = null;
  state.dragStartCard = null;
}

function onPointerCancel(e) {
  if (!state.isDragging) return;
  state.isDragging = false;
  state.dragLockedAxis = null;
  state.dragStartCard = null;
  const viewport = document.getElementById('viewport');
  const tableSurface = document.getElementById('tableSurface');
  viewport.classList.remove('grabbing');
  tableSurface.classList.remove('dragging');
  snapToCard(findClosestCardIndex(null, null), true);
}

// Wheel and keyboard remain unchanged
function onWheel(e) {
  const menu = document.getElementById('menu');
  if (menu.classList.contains('active')) return;
  e.preventDefault();

  if (state.isDragging) {
    state.isDragging = false;
    const viewport = document.getElementById('viewport');
    const tableSurface = document.getElementById('tableSurface');
    viewport.classList.remove('grabbing');
    tableSurface.classList.remove('dragging');
  }

  clearSnapTransition();
  state.isSnapping = false;
  state.tableTy -= e.deltaY * 0.9;
  setTableTransform(state.tableTx, state.tableTy);

  if (state.wheelSnapTimeout) clearTimeout(state.wheelSnapTimeout);
  state.wheelSnapTimeout = setTimeout(() => {
    snapToCard(findClosestCardIndex(null, null), true);
    state.wheelSnapTimeout = null;
  }, 150);
}

function onKeyDown(e) {
  const menu = document.getElementById('menu');
  if (menu.classList.contains('active')) return;
  if (state.isDragging || state.isSnapping) return;

  const key = e.key;
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;
  e.preventDefault();

  const currentCard = state.allCardEls[state.currentCardIndex];
  if (!currentCard) return;

  let bestIdx = state.currentCardIndex;
  let bestDist = Infinity;
  const cx = currentCard.centerX;
  const cy = currentCard.centerY;
  const cardW = getCardWidth();
  const cardH = getCardHeight();
  const colGap = getColumnGap();
  const rowGap = getRowGap();
  const normX = colGap + cardW;
  const normY = rowGap + cardH;

  state.allCardEls.forEach((card, i) => {
    if (i === state.currentCardIndex) return;
    const dx = (card.centerX - cx) / normX;
    const dy = (card.centerY - cy) / normY;
    let score = Infinity;
    if (key === 'ArrowUp'    && dy < -0.25) score = Math.abs(dx) + Math.abs(dy);
    if (key === 'ArrowDown'  && dy >  0.25) score = Math.abs(dx) + Math.abs(dy);
    if (key === 'ArrowLeft'  && dx < -0.25) score = Math.abs(dx) + Math.abs(dy);
    if (key === 'ArrowRight' && dx >  0.25) score = Math.abs(dx) + Math.abs(dy);
    if (score < bestDist) {
      bestDist = score;
      bestIdx = i;
    }
  });

  if (bestIdx !== state.currentCardIndex && bestDist < Infinity) {
    snapToCard(bestIdx, true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('viewport');
  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerCancel);
  viewport.addEventListener('lostpointercapture', () => {
    if (state.isDragging) {
      state.isDragging = false;
      state.dragLockedAxis = null;
      state.dragStartCard = null;
      viewport.classList.remove('grabbing');
      document.getElementById('tableSurface').classList.remove('dragging');
      snapToCard(findClosestCardIndex(null, null), true);
    }
  });

  viewport.addEventListener('touchstart', (e) => {
    if (e.target.closest('.topbar') && !e.target.closest('.viewport')) return;
    if (document.getElementById('menu').classList.contains('active')) return;
    e.preventDefault();
  }, { passive: false });

  viewport.addEventListener('wheel', onWheel, { passive: false });

  document.addEventListener('keydown', onKeyDown);
});
