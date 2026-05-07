function createMainCardHTML(data) {
  const uiClass = data.uiMode || 'opaque';
  return `
    <div class="card-art">
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Image / Video</span>
      </div>
      <div class="art-title"><h2>${data.title}</h2></div>
    </div>
    <div class="card-overlay">
      <div class="card-name"><span>${data.name}</span><small>${data.sub}</small></div>
      <div style="flex:1"></div>
      <div class="card-desc">
        <p>${data.description}</p>
        <div class="tag">${data.tag}</div>
      </div>
    </div>`;
}

function createBlogCardHTML(data) {
  const uiClass = data.uiMode || 'opaque';
  return `
    <div class="blog-art">
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Blog Image</span>
      </div>
    </div>
    <div class="card-overlay">
      <div class="blog-name"><h3>${data.title}</h3><span>${data.label}</span></div>
      <div style="flex:1"></div>
      <div class="blog-desc">
        <p>${data.description}</p>
        <div class="meta">${data.meta}</div>
      </div>
    </div>`;
}

function createDevlogCardHTML(data) {
  const uiClass = data.uiMode || 'opaque';
  return `
    <div class="devlog-art">
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Devlog Image</span>
      </div>
    </div>
    <div class="card-overlay">
      <div class="devlog-name"><h3>${data.title}</h3><span>${data.label}</span></div>
      <div style="flex:1"></div>
      <div class="devlog-desc">
        <p>${data.description}</p>
        <div class="meta">${data.meta}</div>
      </div>
    </div>`;
}
