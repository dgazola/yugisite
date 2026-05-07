// js/snap.js
// Snapping logic and card selection
function findClosestCardIndex(dragDx = null, dragDy = null) {
  const viewport = document.getElementById('viewport');
  const vpW = viewport.clientWidth;
  const vpH = viewport.clientHeight;
  const targetX = vpW / 2 - state.tableTx;
  const targetY = vpH / 2 - state.tableTy;

  const currentCard = state.allCardEls[state.currentCardIndex];
  if (!currentCard) return 0;

  const cardW = getCardWidth();
  const cardH = getCardHeight();
  const colGap = getColumnGap();
  const rowGap = getRowGap();
  const deadzoneX = colGap * DEADZONE_X_FACTOR;
  const deadzoneY = rowGap * DEADZONE_Y_FACTOR;

  const dxCurr = Math.abs(currentCard.centerX - targetX);
  const dyCurr = Math.abs(currentCard.centerY - targetY);
  if (dxCurr <= deadzoneX && dyCurr <= deadzoneY) {
    return state.currentCardIndex;
  }

  // during drag, avoid jumping to outside cards if threshold not crossed
  if (dragDx !== null && dragDy !== null) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    state.allCardEls.forEach(c => {
      minX = Math.min(minX, c.centerX);
      maxX = Math.max(maxX, c.centerX);
      minY = Math.min(minY, c.centerY);
      maxY = Math.max(maxY, c.centerY);
    });
    const marginX = cardW * 0.3;
    const marginY = cardH * 0.3;
    if (dragDx < -DRAG_THRESHOLD && targetX > maxX + marginX) return state.currentCardIndex;
    if (dragDx > DRAG_THRESHOLD && targetX < minX - marginX) return state.currentCardIndex;
    if (dragDy < -DRAG_THRESHOLD && targetY > maxY + marginY) return state.currentCardIndex;
    if (dragDy > DRAG_THRESHOLD && targetY < minY - marginY) return state.currentCardIndex;
  }

  const normX = colGap + cardW;
  const normY = rowGap + cardH;
  let bestIdx = 0;
  let bestDist = Infinity;
  state.allCardEls.forEach((card, i) => {
    const dx = (card.centerX - targetX) / normX;
    const dy = (card.centerY - targetY) / normY;
    let dist = dx * dx + dy * dy;
    if (i === state.currentCardIndex) dist *= CURRENT_CARD_WEIGHT;
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  });
  return bestIdx;
}

function updateCurrentCard(index) {
  state.allCardEls.forEach(c => c.el.classList.remove('current'));
  if (index >= 0 && index < state.allCardEls.length) {
    state.currentCardIndex = index;
    state.allCardEls[index].el.classList.add('current');
  }
  updateCardOpacities();
}

function updateCardOpacities() {
  state.allCardEls.forEach((card, i) => {
    card.el.style.opacity = (i === state.currentCardIndex) ? '1' : '0.28';
  });
}

function setTableTransform(tx, ty) {
  state.tableTx = tx;
  state.tableTy = ty;
  document.getElementById('tableSurface').style.transform = `translate(${tx}px, ${ty}px)`;
}

function clearSnapTransition() {
  const tableSurface = document.getElementById('tableSurface');
  tableSurface.classList.remove('snapping');
  tableSurface.style.transition = 'none';
  if (state.currentSnapOnEnd) {
    tableSurface.removeEventListener('transitionend', state.currentSnapOnEnd);
    state.currentSnapOnEnd = null;
  }
}

function snapToCard(index, animate = true) {
  if (index < 0 || index >= state.allCardEls.length) return;
  const card = state.allCardEls[index];
  const viewport = document.getElementById('viewport');
  const vpW = viewport.clientWidth;
  const vpH = viewport.clientHeight;
  const targetTx = vpW / 2 - card.centerX;
  const targetTy = vpH / 2 - card.centerY;

  if (animate) {
    clearSnapTransition();
    const cardW = getCardWidth();
    const cardH = getCardHeight();
    const scaleY = cardW / cardH;
    const dx = targetTx - state.tableTx;
    const dy = (targetTy - state.tableTy) * scaleY;
    const dist = Math.hypot(dx, dy);
    const duration = Math.min(Math.max(Math.sqrt(dist) * SNAP_SPEED_FACTOR, SNAP_MIN_DURATION), SNAP_MAX_DURATION);
    state.isSnapping = true;
    const tableSurface = document.getElementById('tableSurface');
    tableSurface.style.transition = `transform ${duration}s ${SNAP_EASING}`;
    tableSurface.classList.add('snapping');
    setTableTransform(targetTx, targetTy);
    updateCurrentCard(index);
    const cleanupTimeout = duration * 1000 + 120;
    const onTransitionEnd = () => {
      clearSnapTransition();
      state.isSnapping = false;
      state.currentSnapOnEnd = null;
    };
    state.currentSnapOnEnd = onTransitionEnd;
    tableSurface.addEventListener('transitionend', onTransitionEnd, { once: true });
    setTimeout(() => {
      if (state.isSnapping && state.currentSnapOnEnd === onTransitionEnd) {
        clearSnapTransition();
        state.isSnapping = false;
      }
    }, cleanupTimeout);
  } else {
    clearSnapTransition();
    state.isSnapping = true;
    const tableSurface = document.getElementById('tableSurface');
    tableSurface.style.transition = 'none';
    setTableTransform(targetTx, targetTy);
    updateCurrentCard(index);
    state.isSnapping = false;
    tableSurface.style.transition = 'none';
  }
}
