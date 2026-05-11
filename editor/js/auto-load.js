async function editorAutoLoad() {
  // Load main page data – root‑relative
  try {
    const resp = await fetch('Content/mainpagecards.json');
    if (resp.ok) {
      const json = await resp.json();
      editorProcessMainJson(json);
    }
  } catch { /* ignore */ }

  // Load blog articles – root‑relative
  try {
    const resp = await fetch('Content/blog-posts.json');
    if (resp.ok) {
      const json = await resp.json();
      window.blogArticles = json.map(c => {
        if (!c.translations) return editorMigrateOldCard(c);
        return c;
      });
    }
  } catch { /* ignore */ }

  // Load devlog articles – root‑relative
  try {
    const resp = await fetch('Content/devlogs-posts.json');
    if (resp.ok) {
      const json = await resp.json();
      window.devlogArticles = json.map(c => {
        if (!c.translations) return editorMigrateOldCard(c);
        return c;
      });
    }
  } catch { /* ignore */ }

  // Now that data is loaded, populate the second-language selector and refresh UI
  if (window.editorAfterAutoLoad) {
    window.editorAfterAutoLoad();
  }
}