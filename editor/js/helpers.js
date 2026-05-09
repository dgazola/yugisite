function editorGenerateId() {
  return 'card-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
}

function editorEnsureTranslations(obj, langs) {
  if (!obj) obj = {};
  langs.forEach(lang => {
    if (!obj[lang]) obj[lang] = (lang === 'en' ? '' : (obj['en'] || ''));
  });
  return obj;
}

function editorEscapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function editorReorderAll() {
  ['main'].forEach(col => {
    let order = 0;
    window.editorData.cards.forEach(c => { if (c.column === col) c.order = order++; });
  });
}
function editorGenerateId() {
  return 'card-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
}

function editorEnsureTranslations(obj, langs) {
  if (!obj) obj = {};
  langs.forEach(lang => {
    if (!obj[lang]) obj[lang] = (lang === 'en' ? '' : (obj['en'] || ''));
  });
  return obj;
}

function editorEscapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function editorReorderAll() {
  ['main'].forEach(col => {
    let order = 0;
    window.editorData.cards.forEach(c => { if (c.column === col) c.order = order++; });
  });
}

function editorMigrateOldCard(c) {
  return {
    column: c.column || "main",
    order: c.order || 0,
    type: c.type || c.column,
    id: c.id || editorGenerateId(),
    uiMode: c.uiMode || 'opaque',
    imageUrl: c.imageUrl || null,
    videoUrl: c.videoUrl || null,
    translations: {
      en: {
        name: c.name||"", sub: c.sub||"", label: c.label||"", title: c.title||"",
        description: c.description||"", meta: c.meta||"", tag: c.tag||"",
        link: c.link || ""
      }
    }
  };
}

// Returns the current list of language codes
function editorGetLanguages() {
  return window.editorData.settings.languages || ['en'];
}
function editorMigrateOldCard(c) {
  return {
    column: c.column || "main",
    order: c.order || 0,
    type: c.type || c.column,
    id: c.id || editorGenerateId(),
    uiMode: c.uiMode || 'opaque',
    imageUrl: c.imageUrl || null,
    videoUrl: c.videoUrl || null,
    translations: {
      en: {
        name: c.name||"", sub: c.sub||"", label: c.label||"", title: c.title||"",
        description: c.description||"", meta: c.meta||"", tag: c.tag||"",
        link: c.link || ""
      }
    }
  };
}