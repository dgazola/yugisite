// ── Process loaded JSON (internal; used by auto‑load and revert) ──
function editorProcessMainJson(json) {
  if (Array.isArray(json)) {
    window.editorData.cards = json.map(c => editorMigrateOldCard(c));
    window.editorData.settings = {
      landingCardId: "",
      defaultLanguage: "en",
      languages: ["en"],
      siteTitle: { "en": "Life Snake Studio" }
    };
  } else {
    window.editorData.cards = (json.cards || []).map(c => {
      if (!c.translations) return editorMigrateOldCard(c);
      return c;
    });
    window.editorData.settings = json.settings || {};
    if (!window.editorData.settings.defaultLanguage) window.editorData.settings.defaultLanguage = "en";
    if (!window.editorData.settings.languages) window.editorData.settings.languages = ["en"];
    if (!window.editorData.settings.siteTitle) window.editorData.settings.siteTitle = { "en": "Life Snake Studio" };

    // ensure link is at card level
    window.editorData.cards.forEach(card => {
      card.translations = editorEnsureTranslations(card.translations, window.editorData.settings.languages);
      window.editorData.settings.languages.forEach(lang => {
        if (!card.translations[lang]) card.translations[lang] = {};
        if (card.translations[lang].link === undefined) card.translations[lang].link = "";
      });
      if (card.link === undefined) {
        const firstTrans = Object.values(card.translations)[0];
        card.link = (firstTrans && firstTrans.link) || "";
      }
    });
  }
  // re‑render current tab
  if (window.editorState.currentMainTab === "cards") {
    editorReorderAll();
    editorRefreshLandingSelect();
    editorRenderCardList();
  }
}

function editorProcessArticleJson(json, articleType) {
  const arr = json.map(c => {
    if (!c.translations) {
      const migrated = editorMigrateOldCard(c);
      migrated.isHighlighted = c.isHighlighted || false;
      migrated.articleTitle = c.articleTitle || "";
      migrated.articleBody = c.articleBody || "";
      return migrated;
    }
    window.editorData.settings.languages.forEach(lang => {
      if (c.translations[lang]) {
        c.translations[lang].articleTitle = c.translations[lang].articleTitle || "";
        c.translations[lang].articleBody = c.translations[lang].articleBody || "";
      }
    });
    c.isHighlighted = c.isHighlighted || false;
    return c;
  });

  if (articleType === "blog") window.blogArticles = arr;
  else window.devlogArticles = arr;

  // refresh articles view
  if (window.editorState.currentMainTab === "articles" && window.editorState.currentArticleTab === articleType) {
    editorRenderArticleList();
  }
}

// ── Save (download) current file ──────────────────────
function editorSave() {
  const tab = window.editorState.currentMainTab;
  if (tab === "articles") {
    saveArticleJson();
  } else {
    saveMainJson();
  }
}

function saveMainJson() {
  editorReorderAll();
  window.editorData.cards.forEach(c => { if (!c.id) c.id = editorGenerateId(); });
  if (window.editorData.settings.landingCardId && !window.editorData.cards.find(c => c.id === window.editorData.settings.landingCardId))
    window.editorData.settings.landingCardId = "";
  // Clean up link from translations (it's stored at card level)
  window.editorData.cards.forEach(card => {
    if (card.link === undefined) {
      const anyTrans = Object.values(card.translations)[0];
      card.link = (anyTrans && anyTrans.link) || "";
    }
    Object.keys(card.translations).forEach(lang => {
      if (card.translations[lang]) delete card.translations[lang].link;
    });
  });
  const mainData = {
    settings: window.editorData.settings,
    cards: window.editorData.cards     // no more menu
  };
  downloadJson(mainData, "mainpagecards.json");
}

function saveArticleJson() {
  const articleType = window.editorState.currentArticleTab;
  const arr = articleType === "blog" ? window.blogArticles : window.devlogArticles;
  arr.forEach(a => { if (!a.id) a.id = editorGenerateId(); });
  editorReorderArticles();
  const filename = articleType === "blog" ? "blog-posts.json" : "devlogs-posts.json";
  downloadJson(arr, filename);
}

function downloadJson(dataObj, filename) {
  const json = JSON.stringify(dataObj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Revert (reload) current file from server ──────────
async function editorRevert() {
  if (!confirm(`Revert all changes to the current file?`)) return;

  if (window.editorState.currentMainTab === "articles") {
    const articleType = window.editorState.currentArticleTab;
    const filename = articleType === "blog" ? "blog-posts.json" : "devlogs-posts.json";
    try {
      const resp = await fetch(`../Content/${filename}`);
      if (!resp.ok) throw new Error(`Failed to load ${filename}`);
      const json = await resp.json();
      editorProcessArticleJson(json, articleType);
    } catch (err) {
      alert("Revert failed: " + err.message);
    }
  } else {
    try {
      const resp = await fetch('../Content/mainpagecards.json');
      if (!resp.ok) throw new Error('Failed to load mainpagecards.json');
      const json = await resp.json();
      editorProcessMainJson(json);
    } catch (err) {
      alert("Revert failed: " + err.message);
    }
  }
}

// ── Upload to Repo (GitHub API) ───────────────────────
async function editorUploadToRepo() {
  let jsonContent, repoPath, commitBaseName;

  if (window.editorState.currentMainTab === "articles") {
    const articleType = window.editorState.currentArticleTab;
    const arr = articleType === "blog" ? window.blogArticles : window.devlogArticles;
    arr.forEach(a => { if (!a.id) a.id = editorGenerateId(); });
    editorReorderArticles();
    jsonContent = JSON.stringify(arr, null, 2);
    repoPath = articleType === "blog" ? "Content/blog-posts.json" : "Content/devlogs-posts.json";
    commitBaseName = articleType === "blog" ? "blog-posts.json" : "devlogs-posts.json";
  } else {
    editorReorderAll();
    window.editorData.cards.forEach(c => { if (!c.id) c.id = editorGenerateId(); });
    if (window.editorData.settings.landingCardId && !window.editorData.cards.find(c => c.id === window.editorData.settings.landingCardId))
      window.editorData.settings.landingCardId = "";
    window.editorData.cards.forEach(card => {
      if (card.link === undefined) {
        const anyTrans = Object.values(card.translations)[0];
        card.link = (anyTrans && anyTrans.link) || "";
      }
      Object.keys(card.translations).forEach(lang => {
        if (card.translations[lang]) delete card.translations[lang].link;
      });
    });
    const mainData = {
      settings: window.editorData.settings,
      cards: window.editorData.cards     // no menu
    };
    jsonContent = JSON.stringify(mainData, null, 2);
    repoPath = "Content/mainpagecards.json";
    commitBaseName = "mainpagecards.json";
  }

  let token = localStorage.getItem("github_token") || "";
  let repo = localStorage.getItem("github_repo") || "dgazola/yugisite";
  let branch = localStorage.getItem("github_branch") || "main";

  token = prompt("GitHub Personal Access Token (will be saved locally):", token);
  if (!token) return;
  localStorage.setItem("github_token", token);

  repo = prompt("Repository (owner/repo):", repo);
  if (!repo) return;
  localStorage.setItem("github_repo", repo);

  branch = prompt("Branch name:", branch);
  if (!branch) return;
  localStorage.setItem("github_branch", branch);

  const path = prompt("File path in repo:", repoPath);
  if (!path) return;

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
  try {
    let sha = null;
    try {
      const getResp = await fetch(apiUrl, { headers: { Authorization: `token ${token}` } });
      if (getResp.ok) {
        const fileData = await getResp.json();
        sha = fileData.sha;
      } else if (getResp.status !== 404) throw new Error(`GitHub API error: ${getResp.status}`);
    } catch (e) { /* file may not exist */ }

    const commitMessage = prompt("Commit message:", `Update ${commitBaseName} via editor`);
    if (!commitMessage) return;

    const body = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(jsonContent))),
      branch: branch
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!putResp.ok) {
      const err = await putResp.json();
      throw new Error(err.message || `HTTP ${putResp.status}`);
    }
    alert("✅ File uploaded successfully to GitHub!");
  } catch (err) {
    alert("❌ Upload failed: " + err.message);
  }
}