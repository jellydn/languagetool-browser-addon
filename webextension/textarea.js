/* LanguageTool WebExtension
 * Copyright (C) 2016 Daniel Naber (http://www.danielnaber.de)
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301
 * USA
 */

/* global activeElement, setActiveElement */

const REMIND_BTN_CLASS = "lt-buttons";
const REMIND_WRAPPER_CLASS = "lt-marker-container";
const PREFIX_REMIND = "remind-btn-";
const PREFIX_DISABLE = "disable-lt-btn-";
const PREFIX_ABOUT = "about-lt-btn-";
const MARGIN_TO_CORNER = 8;
const REMIND_BTN_SIZE = 32;
let textareaCounter = 0;
let disableOnDomain = false;

/**
 * Check the element is display or hidden
 * @param DOMElement el
 * @return bool
 */
function isHiddenElement(el) {
  const style = window.getComputedStyle(el);
  return style.display === "none";
}

/**
 * Find the position of element base on window
 * @param DOMElement el
 * @return object position { top, left }
 */
function offset(el) {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

/**
 * True if that is textarea or html5 contentEditable element
 * @param DOMElement focusElement
 * @return bool
 */
function isEditorElement(focusElement) {
  return (
    focusElement &&
    (focusElement.tagName === "TEXTAREA" ||
      focusElement.contentEditable !== "inherit" ||
      (focusElement.tagName === "IFRAME" &&
        (focusElement.className.indexOf("cke_wysiwyg_frame") !== -1 ||
          focusElement.title.indexOf("Rich Text Area") !== -1)))
  );
}

/** event hanlders */

function showAbout(evt) {
  log.info("showAbout", evt);
  const currentUrl = window.location.href;
  $.featherlight({
    iframe: `${chrome.runtime.getURL("about.html")}?pageUrl=${currentUrl}`,
    iframeWidth: 300,
    iframeHeight: 300
  });
}

function checkErrorMenu(evt) {
  log.info("checkErrorMenu", evt);
  evt.stopPropagation();
  evt.preventDefault();
  const currentUrl = window.location.href;
  const textAreaElement = activeElement();
  if (textAreaElement) {
    log.info("active textarea", textAreaElement);
    if (textAreaElement.setActive) {
      textAreaElement.setActive();
    } else {
      textAreaElement.focus();
    }
  }
  $.featherlight({
    iframe: `${chrome.runtime.getURL("popup.html")}?pageUrl=${currentUrl}`,
    iframeWidth: 450,
    iframeHeight: 600
  });
}

function removeAllButtons() {
  const btns = document.getElementsByClassName(REMIND_WRAPPER_CLASS);
  for (let counter = 0; counter < btns.length; counter += 1) {
    const btn = btns[counter];
    btn.parentNode.removeChild(btn);
  }
}

function disableMenu(evt) {
  log.info("disableMenu");
  evt.preventDefault();
  disableOnDomain = true;
  removeAllButtons();
  Tools.getStorage().get(
    {
      disabledDomains: []
    },
    items => {
      log.info("disabledDomains", items);
      const currentUrl = window.location.href;
      const { hostname } = new URL(currentUrl);
      items.disabledDomains.push(hostname);
      Tools.getStorage().set({
        disabledDomains: [...new Set(items.disabledDomains)]
      });
    }
  );
}

/** DOM manupulate */

function remindLanguageToolButton(clickHandler, position) {
  log.info("remindLanguageToolButton position", position);
  const { top, left, offsetHeight, offsetWidth } = position;
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  textareaCounter += 1;
  btn.id = PREFIX_REMIND + textareaCounter;
  btn.className = REMIND_BTN_CLASS;
  btn.setAttribute("tooltip", "Grammar and Style Checker");

  // // style
  btn.style.position = "absolute";
  btn.style.top = `${top +
    offsetHeight -
    REMIND_BTN_SIZE -
    MARGIN_TO_CORNER}px`;
  btn.style.left = `${left +
    offsetWidth -
    REMIND_BTN_SIZE -
    MARGIN_TO_CORNER}px`;
  btn.style.backgroundImage = `url(${chrome.extension.getURL(
    "images/logo.png"
  )})`;

  btn.onmouseenter = () => {
    btn.style.backgroundImage = `url(${chrome.extension.getURL(
      "images/check.png"
    )})`;
  };

  btn.onmouseleave = () => {
    btn.style.backgroundImage = `url(${chrome.extension.getURL(
      "images/logo.png"
    )})`;
  };

  return btn;
}

function disableLanguageToolButton(clickHandler, counter, position) {
  const { top, left, offsetHeight, offsetWidth } = position;
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  btn.id = PREFIX_DISABLE + counter;
  btn.className = REMIND_BTN_CLASS;
  btn.setAttribute("tooltip", "Disable for this domain");
  // style
  btn.style.position = "absolute";
  btn.style.top = `${top +
    offsetHeight -
    REMIND_BTN_SIZE -
    MARGIN_TO_CORNER}px`;
  btn.style.left = `${left +
    offsetWidth -
    REMIND_BTN_SIZE * 2 -
    MARGIN_TO_CORNER}px`;
  btn.style.backgroundImage = `url(${chrome.extension.getURL(
    "images/power-button-symbol.png"
  )})`;
  return btn;
}

function aboutLanguageToolButton(clickHandler, counter, position) {
  const { top, left, offsetHeight, offsetWidth } = position;
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  btn.id = PREFIX_ABOUT + counter;
  btn.className = REMIND_BTN_CLASS;
  btn.setAttribute("tooltip", "About");
  // style
  btn.style.position = "absolute";
  btn.style.top = `${top +
    offsetHeight -
    REMIND_BTN_SIZE -
    MARGIN_TO_CORNER}px`;
  btn.style.left = `${left +
    offsetWidth -
    REMIND_BTN_SIZE * 3 -
    MARGIN_TO_CORNER}px`;
  btn.style.backgroundImage = `url(${chrome.extension.getURL(
    "images/info.png"
  )})`;
  return btn;
}

function textAreaWrapper(textElement, btnElements) {
  const wrapper = document.createElement("div");
  wrapper.className = REMIND_WRAPPER_CLASS;
  wrapper.id = `textarea-wrapper-${textElement.name ||
    textElement.id}-${Date.now()}`;
  wrapper.style.position = "absolute";
  wrapper.style.top = "0px";
  wrapper.style.left = "0px";
  btnElements.forEach(btnElement => {
    wrapper.appendChild(btnElement);
  });
  document.body.appendChild(wrapper);
}

function insertLanguageToolIcon(element) {
  log.info("insertLanguageToolIcon", element, offset(element));
  const { offsetHeight, offsetWidth } = element;
  const position = Object.assign({}, offset(element), {
    offsetHeight,
    offsetWidth
  });
  const btns = [
    aboutLanguageToolButton(showAbout, textareaCounter, position),
    disableLanguageToolButton(disableMenu, textareaCounter, position),
    remindLanguageToolButton(checkErrorMenu, position)
  ];
  textAreaWrapper(element, btns);
}

/**
 * show marker on element
 * @param DOMELement focusElement
 */
function showMarkerOnEditor(focusElement) {
  if (isEditorElement(focusElement)) {
    removeAllButtons();
    setActiveElement(focusElement);
    if (!isHiddenElement(focusElement) && !disableOnDomain) {
      insertLanguageToolIcon(focusElement);
    }
  }
}

function clickOnEditor(currentElement) {
  if (isEditorElement(currentElement)) {
    if (!currentElement.getAttribute("lt-bind-click")) {
      currentElement.addEventListener(
        "mouseup",
        () => {
          log.info("mouseup event");
          showMarkerOnEditor(currentElement);
        },
        false
      );
      currentElement.setAttribute("lt-bind-click", true);
    }
  }
}

function allowToShowMarker(callback) {
  Tools.getStorage().get(
    {
      disabledDomains: []
    },
    items => {
      log.info("disabledDomains", items);
      const currentUrl = window.location.href;
      const { hostname } = new URL(currentUrl);
      log.info("hostname", hostname);
      if (items.disabledDomains.indexOf(hostname) !== -1) {
        disableOnDomain = true;
        removeAllButtons();
      } else {
        callback();
      }
    }
  );
}

// detect on window resize
window.onresize = function onWindowResize(evt) {
  log.info("resize window", evt);
  removeAllButtons();
  if (!disableOnDomain) {
    showMarkerOnEditor(document.activeElement);
  }
};

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  allowToShowMarker(() => {
    const currentElement = document.activeElement;
    showMarkerOnEditor(currentElement);
    clickOnEditor(currentElement);
  });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    allowToShowMarker(() => {
      const currentElement = document.activeElement;
      showMarkerOnEditor(currentElement);
      clickOnEditor(currentElement);
    });
  });
}

// observe the active element to show the marker
document.addEventListener(
  "active-element",
  event => {
    // event.detail.focus: element that received focus
    // event.detail.blur: element that lost focus
    log.info("active-element", event);
    const { focus: focusElement } = event.detail;
    if (!disableOnDomain) {
      showMarkerOnEditor(focusElement);
      clickOnEditor(focusElement);
    }
  },
  false
);

ally.event.activeElement();
