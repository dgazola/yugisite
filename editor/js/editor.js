document.addEventListener('DOMContentLoaded', () => {
  // Landing card select
  document.getElementById('landingCardSelect').addEventListener('change', function() {
    window.editorData.settings.landingCardId = this.value;
  });

  // Add buttons
  document.getElementById('addCardBtn').addEventListener('click', editorAddCard);
  document.getElementById('addArticleBtn').addEventListener('click', editorAddArticle);
  document.getElementById('addMenuItemBtn').addEventListener('click', editorAddMenuItem);
  document.getElementById('addLanguageBtn').addEventListener('click', editorAddLanguage);

  // Save & Revert
  document.getElementById('saveBtn').addEventListener('click', editorSave);
  document.getElementById('revertBtn').addEventListener('click', editorRevert);

  // Kick off auto‑load
  editorAutoLoad();
});