function createMainCardHTML(data) {
  const hasImage = data.imageUrl && data.imageUrl.trim() !== '';
  const hasVideo = data.videoUrl && data.videoUrl.trim() !== '';

  let mediaHTML = '';
  if (hasImage || hasVideo) {
    mediaHTML = `
      ${hasImage ? `<img class="card-image" src="${data.imageUrl}" alt="" />` : ''}
      ${hasVideo ? `<video class="card-video" src="${data.videoUrl}" muted loop playsinline></video>` : ''}`;
  } else {
    // Default placeholder
    mediaHTML = `
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Image / Video</span>
      </div>`;
  }

  return `
    <div class="card-art">
      ${mediaHTML}
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
  const hasImage = data.imageUrl && data.imageUrl.trim() !== '';
  const hasVideo = data.videoUrl && data.videoUrl.trim() !== '';

  let mediaHTML = '';
  if (hasImage || hasVideo) {
    mediaHTML = `
      ${hasImage ? `<img class="card-image" src="${data.imageUrl}" alt="" />` : ''}
      ${hasVideo ? `<video class="card-video" src="${data.videoUrl}" muted loop playsinline></video>` : ''}`;
  } else {
    mediaHTML = `
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Blog Image</span>
      </div>`;
  }

  return `
    <div class="blog-art">
      ${mediaHTML}
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
  const hasImage = data.imageUrl && data.imageUrl.trim() !== '';
  const hasVideo = data.videoUrl && data.videoUrl.trim() !== '';

  let mediaHTML = '';
  if (hasImage || hasVideo) {
    mediaHTML = `
      ${hasImage ? `<img class="card-image" src="${data.imageUrl}" alt="" />` : ''}
      ${hasVideo ? `<video class="card-video" src="${data.videoUrl}" muted loop playsinline></video>` : ''}`;
  } else {
    mediaHTML = `
      <div class="art-placeholder">
        <div class="play-circle"></div>
        <span class="placeholder-text">Devlog Image</span>
      </div>`;
  }

  return `
    <div class="devlog-art">
      ${mediaHTML}
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
