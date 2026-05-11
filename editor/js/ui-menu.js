function editorRenderMenuEdit() {
  const menu = window.editorData.menu;
  const langs = editorGetLanguages();
  if (!menu) window.editorData.menu = [];
  menu.forEach(item => {
    item.translations = editorEnsureTranslations(item.translations, langs);
  });

  document.getElementById('menuEditArea').style.display = 'block';
  document.getElementById('cardList').style.display = 'none';
  const container = document.getElementById('menuEditArea');
  container.innerHTML = '';

  menu.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'card-editor';
    el.innerHTML = `
      <div class="card-editor-header">
        <h4>Menu item #${idx+1}</h4>
        <span class="card-id">ID: ${item.id}</span>
        <div style="display:flex; gap:4px;">
          <button class="btn-icon move-up" title="Move Up">▲</button>
          <button class="btn-icon move-down" title="Move Down">▼</button>
          <button class="btn-icon remove-menu" title="Remove">✕</button>
        </div>
      </div>
      ${generateMultiLangField('Label', 'label', item, langs).outerHTML}
    `;

    // attach multiple listeners per language input
    const multiLangGroups = el.querySelectorAll('.multi-lang-group');
    multiLangGroups.forEach(group => {
      const inputs = group.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('input', (e) => {
          const lang = input.dataset.lang;
          item.translations[lang] = input.value;
          editorRenderMenuList();
        });
      });
    });

    el.querySelector('.remove-menu').addEventListener('click', () => {
      if (confirm('Remove this menu item?')) {
        menu.splice(idx, 1);
        editorRenderMenuEdit();
        editorRenderMenuList();
      }
    });
    el.querySelector('.move-up').addEventListener('click', () => {
      if (idx > 0) {
        [menu[idx], menu[idx-1]] = [menu[idx-1], menu[idx]];
        editorRenderMenuEdit();
        editorRenderMenuList();
      }
    });
    el.querySelector('.move-down').addEventListener('click', () => {
      if (idx < menu.length-1) {
        [menu[idx], menu[idx+1]] = [menu[idx+1], menu[idx]];
        editorRenderMenuEdit();
        editorRenderMenuList();
      }
    });
    container.appendChild(el);
  });

  if (menu.length === 0) {
    container.innerHTML = '<p style="color:#5c5430;">No menu items yet. Add one.</p>';
  }
}

function editorRenderMenuList() {
  const menuList = document.getElementById('menuList');
  menuList.innerHTML = '';
  (window.editorData.menu || []).forEach((item, idx) => {
    // show English label for brevity
    const label = item.translations['en'] || item.translations[Object.keys(item.translations)[0]] || item.id;
    const div = document.createElement('div');
    div.className = 'menu-editor-item';
    div.innerHTML = `<span>${idx+1}. ${label} (${item.id})</span>
      <button class="btn-icon remove-menu-item" data-idx="${idx}">✕</button>`;
    div.querySelector('.remove-menu-item').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Remove this menu item?')) {
        window.editorData.menu.splice(idx, 1);
        editorRenderMenuList();
        editorRenderMenuEdit();
      }
    });
    menuList.appendChild(div);
  });
}

function editorAddMenuItem() {
  const langs = editorGetLanguages();
  const id = prompt('Enter the card ID this menu item links to (e.g. home, world, tcg):');
  if (!id) return;
  if (window.editorData.menu.find(m => m.id === id)) {
    alert('Menu item with this ID already exists.');
    return;
  }
  const newItem = { id: id, translations: {} };
  langs.forEach(lang => {
    newItem.translations[lang] = id; // default to ID
  });
  window.editorData.menu.push(newItem);
  editorRenderMenuList();
  editorRenderMenuEdit();
}