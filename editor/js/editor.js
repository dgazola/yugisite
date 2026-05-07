(function() {
  let data = {
    settings: {
      landingCardId: "",
      defaultLanguage: "en",
      languages: ["en"],
      siteTitle: { "en": "Life Snake Studio" }
    },
    menu: [],
    cards: []
  };
  let currentColumn = "main";
  let currentLang = "en";
  let currentMainTab = "cards";

  const mainTabs = document.getElementById('mainTabs');
 
