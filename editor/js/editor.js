// Editor initialisation & event wiring

document.addEventListener('DOMContentLoaded', () => {
  // Landing card select change
  const landingSelect = document.getElementById('landingCardSelect');
  landingSelect.addEventListener('change', () => {
    window.editorData.settings.landingCardId = landingSelect.value;
  });

  // Card add button
  document.getElementById('addCardBtn').addEventListener('click', editorAddCard);

  // Menu add button
  document.getElementById('addMenuItemBtn').addEventListener('click', editorAddMenuItem);

  // Language add button
  document.getElementById('addLanguageBtn').addEventListener('click', editorAddLanguage);

  // Load / Save / Upload buttons
  document.getElementById('loadLocalBtn').addEventListener('click', editorLoadLocal);
  document.getElementById('loadUrlBtn').addEventListener('click', editorLoadUrl);
  document.getElementById('loadRepoBtn').addEventListener('click', editorLoadRepo);
  document.getElementById('saveBtn').addEventListener('click', editorSave);
  document.getElementById('uploadRepoBtn').addEventListener('click', editorUploadToRepo);

  // Auto load from server
  editorAutoLoad();
});
