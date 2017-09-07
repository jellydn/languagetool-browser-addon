document.addEventListener("DOMContentLoaded", renderText);

function renderText() {
  Tools.track("internal", "about-opened");
  document.getElementById("about-desc").textContent = chrome.i18n.getMessage(
    "aboutDesc"
  );
  document.getElementById("about-link").textContent = chrome.i18n.getMessage(
    "aboutLink"
  );
}
