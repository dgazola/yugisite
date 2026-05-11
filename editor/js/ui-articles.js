let selectedArticleIndex = -1;

function getCurrentArticleArray() {
  return window.editorState.currentArticleTab === 'blog' ? window.blogArticles : window.devlogArticles;
}

// ── Render article list (left panel) ────────────────────
function editorRenderArticleList() {
  const container = document.getElementById('articleListContainer');
  const list = getCurrentArticleArray();
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `<div style="padding:20px;color:#5c5430;">No ${window.editorState.currentArticleTab} articles yet.</div>`;
    document.getElementById('articleEditContainer').innerHTML = '';
    return;
  }

  list.forEach((article, idx) => {
    const trans = article.translations['en'] || Object.values(article.translations)[0] || {};
    const title = trans.title || '(untitled)';
    const highlighted = article.isHighlighted ? '★ ' : '';
    const color = article.color || '';

    const item = document.createElement('div');
    item.className = 'list-item';
    if (idx === selectedArticleIndex) item.classList.add('selected');
    item.innerHTML = `
      <div class="list-item-color" style="background:${color || 'transparent'};"></div>
      <div class="list-item-title">${highlighted}${editorEscapeHtml(title)}</div>
      <div class="list-item-actions">
        <button class="move-up-btn" title="Move Up">▲</button>
        <button class="move-down-btn" title="Move Down">▼</button>
        <button class="remove-btn" title="Remove">✕</button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      selectedArticleIndex = idx;
      editorRenderArticleList();
      editorRenderSelectedArticle();
    });

    item.querySelector('.move-up-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editorMoveArticle(article.id, -1);
    });
    item.querySelector('.move-down-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editorMoveArticle(article.id, 1);
    });
    item.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editorRemoveArticle(article.id);
    });

    container.appendChild(item);
  });

  if (selectedArticleIndex < 0 || selectedArticleIndex >= list.length) {
    selectedArticleIndex = 0;
    if (list.length > 0) {
      container.querySelectorAll('.list-item')[0]?.classList.add('selected');
    }
  }

  editorRenderSelectedArticle();
}

// ── Render selected article editor (right panel) ─────────
function editorRenderSelectedArticle() {
  const container = document.getElementById('articleEditContainer');
  const list = getCurrentArticleArray();
  const article = list[selectedArticleIndex];
  if (!article) {
    container.innerHTML = '<div style="padding:20px;color:#5c5430;">No article selected.</div>';
    return;
  }

  const secondLang = window.editorState.secondLang || 'en';

  if (!article.translations) article.translations = {};
  if (!article.translations['en']) article.translations['en'] = {};
  if (!article.translations[secondLang]) article.translations[secondLang] = {};

  const el = document.createElement('div');
  el.className = 'card-editor';
  el.innerHTML = `
    <div class="card-editor-header">
      <h4>Editing article <span style="font-size:0.7rem;color:var(--editor-muted)">${article.id}</span></h4>
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
      ${ generateMultiLangField('Card Title', 'title', article, secondLang).outerHTML }
      ${ generateMultiLangField('Card Description', 'description', article, secondLang, true).outerHTML }
      ${ generateMultiLangField('Label', 'label', article, secondLang).outerHTML }
      ${ generateMultiLangField('Meta', 'meta', article, secondLang).outerHTML }
      ${ generateMultiLangField('Tag', 'tag', article, secondLang).outerHTML }
      ${ generateMultiLangField('Article Title', 'articleTitle', article, secondLang).outerHTML }
      ${ generateMultiLangField('Article Body', 'articleBody', article, secondLang, true).outerHTML }
    </div>
  `;

  el.querySelector('.field-highlighted').addEventListener('change', (e) => { article.isHighlighted = e.target.checked; });
  el.querySelector('.field-uimode').addEventListener('change', (e) => { article.uiMode = e.target.value; });
  el.querySelector('.field-imageurl').addEventListener('input', (e) => { article.imageUrl = e.target.value; });
  el.querySelector('.field-videourl').addEventListener('input', (e) => { article.videoUrl = e.target.value; });
  el.querySelector('.field-color').addEventListener('input', (e) => { article.color = e.target.value || null; });

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

  container.innerHTML = '';
  container.appendChild(el);
}

// ── Add / Remove / Move ─────────────────────────────────
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
  selectedArticleIndex = getCurrentArticleArray().length - 1;
  editorRenderArticleList();
}

function editorRemoveArticle(id) {
  if (!confirm('Remove this article?')) return;
  const arr = getCurrentArticleArray();
  const idx = arr.findIndex(a => a.id === id);
  if (idx >= 0) arr.splice(idx, 1);
  editorReorderArticles();
  if (selectedArticleIndex >= arr.length) {
    selectedArticleIndex = Math.max(0, arr.length - 1);
  }
  editorRenderArticleList();
}

function editorMoveArticle(id, direction) {
  const arr = getCurrentArticleArray();
  const idx = arr.findIndex(a => a.id === id);
  if (idx < 0) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= arr.length) return;
  [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
  if (selectedArticleIndex === idx) selectedArticleIndex = swapIdx;
  else if (selectedArticleIndex === swapIdx) selectedArticleIndex = idx;
  editorReorderArticles();
  editorRenderArticleList();
}

function editorReorderArticles() {
  const arr = getCurrentArticleArray();
  arr.forEach((a, i) => a.order = i);
}