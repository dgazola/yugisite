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

  if (!state.dragLockedAxis) {
    // Decide axis after minimum movement
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
      // Free movement before lock
      setTableTransform(state.tableStartTx + dx, state.tableStartTy + dy);
    }
    return;
  }

  // We have a lock – compute delta from lock start
  const lockDx = pos.x - state.lockStartX;
  const lockDy = pos.y - state.lockStartY;

  if (state.dragLockedAxis === 'x') {
    // Check for switch to vertical
    if (Math.abs(lockDy) > AXIS_SWITCH_THRESHOLD) {
      // Switch to y-axis, resetting lock start to current position
      state.dragLockedAxis = 'y';
      state.lockStartX = pos.x;
      state.lockStartY = pos.y;
      state.lockStartTx = state.tableTx;
      state.lockStartTy = state.tableTy;
      // No movement on this frame for the old axis
      return;
    }
    setTableTransform(state.lockStartTx + lockDx, state.lockStartTy);
  } else if (state.dragLockedAxis === 'y') {
    if (Math.abs(lockDx) > AXIS_SWITCH_THRESHOLD) {
      state.dragLockedAxis = 'x';
      state.lockStartX = pos.x;
      state.lockStartY = pos.y;
      state.lockStartTx = state.tableTx;
      state.lockStartTy = state.tableTy;
      return;
    }
    setTableTransform(state.lockStartTx, state.lockStartTy + lockDy);
  }
}

function onPointerUp(e) {
  if (!state.isDragging) return;
  state.isDragging = false;
  state.dragLockedAxis = null;

  const viewport = document.getElementById('viewport');
  const tableSurface = document.getElementById('tableSurface');
  viewport.classList.remove('grabbing');
  tableSurface.classList.remove('dragging');
  viewport.releasePointerCapture(e.pointerId);

  if (!state.pointerMoved) {
    const pos = getEventPos(e);
    const clickedIndex = findCardAtPoint(pos.x, pos.y);
    if (clickedIndex !== -1) {
      snapToCard(clickedIndex, true);
      return;
    }
  }

  const pos = getEventPos(e);
  const dragDx = pos.x - state.pointerStartX;
  const dragDy = pos.y - state.pointerStartY;
  snapToCard(findClosestCardIndex(dragDx, dragDy), true);
}

function onPointerCancel(e) {
  if (!state.isDragging) return;
  state.isDragging = false;
  state.dragLockedAxis = null;
  const viewport = document.getElementById('viewport');
  const tableSurface = document.getElementById('tableSurface');
  viewport.classList.remove('grabbing');
  tableSurface.classList.remove('dragging');
  snapToCard(findClosestCardIndex(null, null), true);
}

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
