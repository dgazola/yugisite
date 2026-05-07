// Auto-load on startup: fetch mainpagecards.json from server

async function editorAutoLoad() {
  try {
    const resp = await fetch('../Content/mainpagecards.json');
    if (!resp.ok) throw new Error('Not found');
    const json = await resp.json();
    editorProcessLoadedJson(json);
  } catch {
    console.log('No JSON found on server.');
    editorRenderLangTabs();
    editorRenderCardList();
  }
}
