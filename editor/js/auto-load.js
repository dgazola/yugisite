async function editorAutoLoad() {
  // Load main page data
  try {
    const resp = await fetch('../Content/mainpagecards.json');
    if (resp.ok) {
      const json = await resp.json();
      editorProcessMainJson(json);
    }
  } catch { /* ignore */ }

  // Load blog articles
  try {
    const resp = await fetch('../Content/blog-posts.json');
    if (resp.ok) {
      const json = await resp.json();
      window.blogArticles = json.map(c => {
        if (!c.translations) return editorMigrateOldCard(c);
        return c;
      });
    }
  } catch { /* ignore */ }

  // Load devlog articles
  try {
    const resp = await fetch('../Content/devlogs-posts.json');
    if (resp.ok) {
      const json = await resp.json();
      window.devlogArticles = json.map(c => {
        if (!c.translations) return editorMigrateOldCard(c);
        return c;
      });
    }
  } catch { /* ignore */ }

  // Start on the cards tab (already set by processMainJson)
}