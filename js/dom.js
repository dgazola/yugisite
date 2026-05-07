// HTML generators – overlay‑style cards

function createMainCardHTML(data) {
  return `
    <div class="card-art-bg"></div>
    <div class="card-name">${data.name}<small>${data.sub}</small></div>
    <div class="card-desc">
      <p>${data.description}</p>
      <div class="tag">${data.tag}</div>
    </div>`;
}

function createBlogCardHTML(data) {
  return `
    <div class="card-art-bg"></div>
    <div class="blog-name"><h3>${data.title}</h3><span>${data.label}</span></div>
    <div class="blog-desc">
      <p>${data.description}</p>
      <div class="meta">${data.meta}</div>
    </div>`;
}

function createDevlogCardHTML(data) {
  return `
    <div class="card-art-bg"></div>
    <div class="devlog-name"><h3>${data.title}</h3><span>${data.label}</span></div>
    <div class="devlog-desc">
      <p>${data.description}</p>
      <div class="meta">${data.meta}</div>
    </div>`;
}
