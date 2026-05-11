function getCurrentArticleArray() {
  return window.editorState.currentArticleTab === 'blog' ? window.blogArticles : window.devlogArticles;
}

function editorRenderArticleList() {
  const list = getCurrentArticleArray();
  const container = document.getElementById('articleList');
  const langs = editorGetLanguages();
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:#5c5430;">No ${window.editorState.currentArticleTab} articles. Click "+ Add Article".</div>`;
    return;
  }
  list.forEach((article, idx) => {
    // ensure translations
    langs.forEach(lang => {
      if (!article.translations) article.translations = {};
      if (!article.translations[lang]) article.translations[lang] = {};
    });

    const el = document.createElement('div');
    el.className = 'card-editor';
    el.setAttribute('data-article-id', article.id);
    el.innerHTML = `
      <div class="card-editor-header">
        <h4>Article #${idx+1} (${window.editorState.currentArticleTab})</h4>
        <span class="card-id">${article.id}</span>
        <div style="display:flex; gap:4px;">
          <button class="btn-icon move-up" title="Move Up">▲</button>
          <button class="btn-icon move-down" title="Move Down">▼</button>
          <button class="btn-icon remove-article" title="Remove">✕</button>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label>Highlighted</label>
        <input type="checkbox" class="field-highlighted" ${article.isHighlighted ? 'checked' : ''} style="width:auto;">
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label>UI Mode</label>
        <select class="field-uimode" style="padding:6px;">
          <option value="opaque" ${article.uiMode === 'opaque' ? 'selected' : ''}>Opaque</option>
          <option value="transparent" ${article.uiMode === 'transparent' ? 'selected' : ''}>Transparent</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label>Image URL</label>
        <input type="text" class="field-imageurl" value="${editorEscapeHtml(article.imageUrl || '')}" />
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label>WebM Video URL</label>
        <input type="text" class="field-videourl" value="${editorEscapeHtml(article.videoUrl || '')}" />
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label>Card Colour <span style="font-weight:normal;font-size:0.7rem;">(optional)</span></label>
        <input type="color" class="field-color" value="${article.color || ''}" />
      </div>
      <div class="card-editor-grid">
        ${ generateMultiLangField('Card Title', 'title', article, langs).outerHTML }
        ${ generateMultiLangField('Card Description', 'description', article, langs, true).outerHTML }
        ${ generateMultiLangField('Label', 'label', article, langs).outerHTML }
        ${ generateMultiLangField('Meta', 'meta', article, langs).outerHTML }
        ${ generateMultiLangField('Tag', 'tag', article, langs).outerHTML }
        ${ generateMultiLangField('Article Title', 'articleTitle', article, langs).outerHTML }
        ${ generateMultiLangField('Article Body', 'articleBody', article, langs, true).outerHTML }
      </div>`;

    // shared fields events
    el.querySelector('.field-highlighted').addEventListener('change', (e) => { article.isHighlighted = e.target.checked; });
    el.querySelector('.field-uimode').addEventListener('change', (e) => { article.uiMode = e.target.value; });
    el.querySelector('.field-imageurl').addEventListener('input', (e) => { article.imageUrl = e.target.value; });
    el.querySelector('.field-videourl').addEventListener('input', (e) => { article.videoUrl = e.target.value; });
    el.querySelector('.field-color').addEventListener('input', (e) => { article.color = e.target.value || null; });

    // multi‑lang field events
    const multiLangGroups = el.querySelectorAll('.multi-lang-group');
    multiLangGroups.forEach(group => {
      const field = group.dataset.field;
      const inputs = group.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('input', (e) => {
          const lang = input.dataset.lang;
          if (!article.translations[lang]) article.translations[lang] = {};
          article.translations[lang][field] = input.value;
        });
      });
    });

    el.querySelector('.remove-article').addEventListener('click', () => editorRemoveArticle(article.id));
    el.querySelector('.move-up').addEventListener('click', () => editorMoveArticle(article.id, -1));
    el.querySelector('.move-down').addEventListener('click', () => editorMoveArticle(article.id, 1));

    container.appendChild(el);
  });
}

function editorAddArticle() {
  const langs = editorGetLanguages();
  const newArticle = {
    column: window.editorState.currentArticleTab,
    order: getCurrentArticleArray().length,
    type: window.editorState.currentArticleTab,
    id: editorGenerateId(),
    isHighlighted: false,
    uiMode: 'opaque',
    imageUrl: null,
    videoUrl: null,
    color: null,
    translations: {}
  };
  langs.forEach(lang => {
    newArticle.translations[lang] = {
      name: "", sub: "", label: "", title: "New Article", description: "",
      meta: "", tag: "",
      articleTitle: "Article Title", articleBody: "Article body text..."
    };
  });
  getCurrentArticleArray().push(newArticle);
  editorReorderArticles();
  editorRenderArticleList();
}

function editorRemoveArticle(id) {
  if (!confirm('Remove this article?')) return;
  const arr = getCurrentArticleArray();
  const idx = arr.findIndex(a => a.id === id);
  if (idx >= 0) arr.splice(idx, 1);
  editorReorderArticles();
  editorRenderArticleList();
}

function editorMoveArticle(id, direction) {
  const arr = getCurrentArticleArray();
  const idx = arr.findIndex(a => a.id === id);
  if (idx < 0) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= arr.length) return;
  [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
  editorReorderArticles();
  editorRenderArticleList();
}

function editorReorderArticles() {
  const arr = getCurrentArticleArray();
  arr.forEach((a, i) => a.order = i);
}