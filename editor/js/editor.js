document.addEventListener('DOMContentLoaded', () => {
  // Landing card select
  document.getElementById('landingCardSelect').addEventListener('change', function() {
    window.editorData.settings.landingCardId = this.value;
  });

  // Add buttons (cards, articles)
  document.getElementById('addCardBtn').addEventListener('click', editorAddCard);
  document.getElementById('addArticleBtn').addEventListener('click', editorAddArticle);

  // Save & Revert
  document.getElementById('saveBtn').addEventListener('click', editorSave);
  document.getElementById('revertBtn').addEventListener('click', editorRevert);

  // Second language selector
  const secondLangSelect = document.getElementById('secondLangSelect');

  function populateSecondLangSelect() {
    const otherLangs = window.editorData.settings.languages.filter(l => l !== 'en');
    secondLangSelect.innerHTML = '';
    if (otherLangs.length === 0) {
      // Only English exists
      secondLangSelect.innerHTML = '<option value="en">EN</option>';
      window.editorState.secondLang = 'en';
      return;
    }

    otherLangs.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = lang.toUpperCase();
      secondLangSelect.appendChild(opt);
    });

    // Set current secondLang to first other language if not set or invalid
    if (!otherLangs.includes(window.editorState.secondLang)) {
      window.editorState.secondLang = otherLangs[0];
    }
    secondLangSelect.value = window.editorState.secondLang;
  }

  // Called from ui-languages.js after adding/removing a language
  window.editorOnLanguagesChanged = function() {
    populateSecondLangSelect();
    // Re-render current editor panel if needed
    if (window.editorState.currentMainTab === 'cards') {
      editorRenderSelectedCard();
    } else if (window.editorState.currentMainTab === 'articles') {
      editorRenderSelectedArticle();
    }
  };

  // Called from auto-load.js after all data is loaded
  window.editorAfterAutoLoad = function() {
    populateSecondLangSelect();
    // Re-render the current tab to reflect the loaded data
    if (window.editorState.currentMainTab === 'cards') {
      editorRenderCardList();
    } else if (window.editorState.currentMainTab === 'articles') {
      editorRenderArticleList();
    } else if (window.editorState.currentMainTab === 'languages') {
      editorRenderLanguageList();
    }
  };

  secondLangSelect.addEventListener('change', () => {
    window.editorState.secondLang = secondLangSelect.value;
    // Re-render current tab editor
    if (window.editorState.currentMainTab === 'cards') {
      editorRenderSelectedCard();
    } else if (window.editorState.currentMainTab === 'articles') {
      editorRenderSelectedArticle();
    }
  });

  // Kick off auto‑load
  editorAutoLoad();
});