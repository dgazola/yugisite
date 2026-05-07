// js/dom.js
// HTML generators for the three card types
function createMainCardHTML(data) {
  return `
    <div class="card-name">${data.name}<small>${data.sub}</small></div>
    <div class="card-art">
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Image / Video</span>
      </div>
      <div class="art-title"><h2>${data.title}</h2></div>
    </div>
    <div class="card-desc">
      <p>${data.description}</p>
      <div class="tag">${data.tag}</div>
    </div>`;
}

function createBlogCardHTML(data) {
  return `
    <div class="blog-name"><h3>${data.title}</h3><span>${data.label}</span></div>
    <div class="blog-art">
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Blog Image</span>
      </div>
    </div>
    <div class="blog-desc">
      <p>${data.description}</p>
      <div class="meta">${data.meta}</div>
    </div>`;
}

function createDevlogCardHTML(data) {
  return `
    <div class="devlog-name"><h3>${data.title}</h3><span>${data.label}</span></div>
    <div class="devlog-art">
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Devlog Image</span>
      </div>
    </div>
    <div class="devlog-desc">
      <p>${data.description}</p>
      <div class="meta">${data.meta}</div>
    </div>`;
}
