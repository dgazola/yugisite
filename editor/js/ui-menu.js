// Menu editing rendering and actions

function editorRenderMenuEdit() {
  const menu = window.editorData.menu;
  if (!menu) window.editorData.menu = [];
  menu.forEach(item => {
    item.translations = editorEnsureTranslations(item.translations, window.editorData.settings.languages);
  });

  document.getElementById('menuEditArea').style.display = 'block';
  document.getElementById('cardList').style.display = 'none';
  const container = document.getElementById('menuEditArea');
  container.innerHTML = '';

  menu.forEach((item, idx) => {
    const label = item.translations[window.editorState.currentLang] ||
                  item.translations[window.editorData.settings.defaultLanguage] ||
                  item.id;
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
      <div class="form-group">
        <label>Label (${window.editorState.currentLang})</label>
        <input type="text" class="menu-label" value="${editorEscapeHtml(label)}">
      </div>`;
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
    el.querySelector('.menu-label').addEventListener('input', (e) => {
      item.translations[window.editorState.currentLang] = e.target.value;
      editorRenderMenuList();
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
    const label = item.translations[window.editorState.currentLang] ||
                  item.translations[window.editorData.settings.defaultLanguage] ||
                  item.id;
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
  const id = prompt('Enter the card ID this menu item links to (e.g. home, world, tcg):');
  if (!id) return;
  if (window.editorData.menu.find(m => m.id === id)) {
    alert('Menu item with this ID already exists.');
    return;
  }
  const newItem = { id: id, translations: {} };
  window.editorData.settings.languages.forEach(lang => {
    newItem.translations[lang] = id;
  });
  window.editorData.menu.push(newItem);
  editorRenderMenuList();
  editorRenderMenuEdit();
}
