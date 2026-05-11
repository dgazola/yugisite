function attachMenuEvents() {
  const menu = document.getElementById('menu');
  const links = menu.querySelectorAll('a[data-nav]');
  links.forEach(link => {
    link.addEventListener('click', () => {
      const navId = link.getAttribute('data-nav');
      toggleMenu();

      // Special shortcuts
      if (navId === 'blog-menu') {
        window.location.href = 'article.html?type=blog';
        return;
      }
      if (navId === 'devlog-menu') {
        window.location.href = 'article.html?type=devlog';
        return;
      }

      // For main cards: find the card and follow its link
      const card = state.rawCards.find(c => c.id === navId);
      if (card && card.column === 'main') {
        const link = card.link;
        if (link) {
          window.open(link, '_blank');
          return;
        }
      }

      // Fallback: snap to the card on the main page (if visible)
      const foundIndex = state.allCardEls.findIndex(c => c.id === navId);
      if (foundIndex >= 0) snapToCard(foundIndex, true);
    });
  });
}

function toggleMenu() {
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('overlay');
  const viewport = document.getElementById('viewport');

  if (menu.classList.contains('active')) {
    menu.classList.remove('active');
    overlay.classList.remove('active');
    viewport.classList.remove('menu-open');
  } else {
    menu.classList.add('active');
    overlay.classList.add('active');
    viewport.classList.add('menu-open');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const menuTrigger = document.getElementById('menuTrigger');
  const overlay = document.getElementById('overlay');

  if (menuTrigger) {
    menuTrigger.addEventListener('click', toggleMenu);
  }

  overlay.addEventListener('click', toggleMenu);
});