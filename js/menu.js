// js/menu.js
// sidebar menu toggle
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
  const menuBtn = document.getElementById('menuBtn');
  const overlay = document.getElementById('overlay');
  menuBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // navigation links inside the menu
  const menu = document.getElementById('menu');
  menu.querySelectorAll('a[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      const navId = link.getAttribute('data-nav');
      toggleMenu();
      const foundIndex = state.allCardEls.findIndex(c => c.id === navId);
      if (foundIndex >= 0) snapToCard(foundIndex, true);
    });
  });
});
