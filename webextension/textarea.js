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
"use strict";
const REMIND_BTN_CLASS = "lt-buttons";
const REMIND_WRAPPER_CLASS = "lt-marker-container";
const PREFIX_REMIND = "remind-btn-";
const PREFIX_CHECK = "check-lt-err-btn-";
const PREFIX_DISABLE = "disable-lt-btn-";
const PREFIX_ABOUT = "about-lt-btn-";
const MARGIN_TO_CORNER = 8;
const REMIND_BTN_SIZE = 32;
const REMIND_ACTION_BTN_SIZE = 24;
const toggleState = {};
let textareaCounter = 0;
let totalTextAreas = 0;
let totalContentEditable = 0;
let disableOnPage = false;

/* util function for checking html */

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
  const rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
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

function insertLanguageToolIcon(element) {
  log.info("insertLanguageToolIcon", element, offset(element));
  const { left, top, offsetHeight, offsetWidth } = element;
  const position = Object.assign({}, offset(element), {
    offsetHeight,
    offsetWidth
  });
  const btns = [
    aboutLanguageToolButton(showAbout, textareaCounter, position),
    disableLanguageToolButton(disableMenu, textareaCounter, position),
    checkLanguageErrorButton(checkErrorMenu, textareaCounter, position),
    remindLanguageToolButton(showRemindMenu, position)
  ];
  textAreaWrapper(element, btns);
}

/** event hanlders */

function showRemindMenu(evt) {
  evt.preventDefault();
  const targetId = evt.target.id;
  log.info("ok - show remind menu", targetId);
  const counter = Number(targetId.substr(PREFIX_REMIND.length));
  toggleState[counter] = !toggleState[counter];
  log.info("ok - counter", counter, toggleState);
}

function showAbout(evt) {
  log.info("showAbout", evt);
  $.featherlight({
    iframe:
      chrome.runtime.getURL("about.html") + "?pageUrl=" + window.location.href,
    iframeWidth: 300,
    iframeHeight: 300
  });
}

function checkErrorMenu(evt) {
  log.info("checkErrorMenu", evt);
  evt.stopPropagation();
  evt.preventDefault();
  const targetId = evt.target.id;
  const counter = Number(targetId.substr(PREFIX_CHECK.length));
  toggleState[counter] = !toggleState[counter];
  const checkBtn = document.getElementById(PREFIX_CHECK + counter);
  const disableBtn = document.getElementById(PREFIX_DISABLE + counter);
  const aboutBtn = document.getElementById(PREFIX_ABOUT + counter);
  checkBtn.style.display = "none";
  disableBtn.style.display = "none";
  aboutBtn.style.display = "none";

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
    iframe:
      chrome.runtime.getURL("popup.html") + "?pageUrl=" + window.location.href,
    iframeWidth: 450,
    iframeHeight: 600
  });
}

function disableMenu(evt) {
  log.info("disableMenu");
  evt.preventDefault();
  disableOnPage = true;
  removeAllButtons();
}

function removeAllButtons() {
  const btns = document.getElementsByClassName(REMIND_WRAPPER_CLASS);
  for (let counter = 0; counter < btns.length; counter += 1) {
    const btn = btns[counter];
    btn.parentNode.removeChild(btn);
  }
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
  btn.setAttribute("tooltip", "LanguageTool");
  // // style
  btn.style.position = "absolute";
  btn.style.top =
    top + offsetHeight - REMIND_ACTION_BTN_SIZE - MARGIN_TO_CORNER + "px";
  btn.style.left =
    left + offsetWidth - REMIND_BTN_SIZE - MARGIN_TO_CORNER + "px";
  btn.style.backgroundImage = `url(${chrome.extension.getURL(
    "images/icon48.png"
  )})`;
  return btn;
}

function checkLanguageErrorButton(clickHandler, counter, position) {
  const { top, left, offsetHeight, offsetWidth } = position;
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  btn.id = PREFIX_CHECK + counter;
  btn.className = REMIND_BTN_CLASS;
  btn.setAttribute("tooltip", "Grammar and Style Checker");
  // style
  btn.style.position = "absolute";
  btn.style.top =
    top +
    offsetHeight -
    REMIND_ACTION_BTN_SIZE -
    MARGIN_TO_CORNER -
    REMIND_BTN_SIZE * 1 +
    "px";
  btn.style.left =
    left +
    offsetWidth -
    REMIND_BTN_SIZE -
    MARGIN_TO_CORNER +
    (REMIND_BTN_SIZE - REMIND_ACTION_BTN_SIZE) / 2 +
    "px";
  btn.style.backgroundImage = `url(${chrome.extension.getURL(
    "images/check.png"
  )})`;
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
  btn.style.top =
    top +
    offsetHeight -
    REMIND_ACTION_BTN_SIZE -
    MARGIN_TO_CORNER -
    REMIND_BTN_SIZE * 2 +
    "px";
  btn.style.left =
    left +
    offsetWidth -
    REMIND_BTN_SIZE -
    MARGIN_TO_CORNER +
    (REMIND_BTN_SIZE - REMIND_ACTION_BTN_SIZE) / 2 +
    "px";
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
  btn.style.top =
    top +
    offsetHeight -
    REMIND_ACTION_BTN_SIZE -
    MARGIN_TO_CORNER -
    REMIND_BTN_SIZE * 3 +
    "px";
  btn.style.left =
    left +
    offsetWidth -
    REMIND_BTN_SIZE -
    MARGIN_TO_CORNER +
    (REMIND_BTN_SIZE - REMIND_ACTION_BTN_SIZE) / 2 +
    "px";
  btn.style.backgroundImage = `url(${chrome.extension.getURL(
    "images/info.png"
  )})`;
  return btn;
}

function textAreaWrapper(textElement, btnElements) {
  const wrapper = document.createElement("div");
  wrapper.className = REMIND_WRAPPER_CLASS;
  wrapper.id =
    "textarea-wrapper-" +
    (textElement.name || textElement.id) +
    "-" +
    Date.now();
  wrapper.style.position = "absolute";
  wrapper.style.top = "0px";
  wrapper.style.left = "0px";
  for (const btnElement of btnElements) {
    wrapper.appendChild(btnElement);
  }
  document.body.appendChild(wrapper);
}

/**
 * show marker on element
 * @param DOMELement focusElement 
 */
function showMarkerOnEditor(focusElement) {
  if (isEditorElement(focusElement)) {
    removeAllButtons();
    setActiveElement(focusElement);
    if (!isHiddenElement(focusElement) && !disableOnPage) {
      insertLanguageToolIcon(focusElement);
    }
  }
}

function clickOnEditor(currentElement) {
  if (isEditorElement(currentElement)) {
    if (!currentElement.getAttribute("lt-bind-click")) {
      currentElement.addEventListener(
        "mouseup",
        function() {
          log.info("mouseup event");
          showMarkerOnEditor(currentElement);
        },
        false
      );
      currentElement.setAttribute("lt-bind-click", true);
    }
  }
}

// detect on window resize
window.onresize = function(evt) {
  log.info("resize window", evt);
  removeAllButtons();
  showMarkerOnEditor(document.activeElement);
};

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  const currentElement = document.activeElement;
  showMarkerOnEditor(currentElement);
  clickOnEditor(currentElement);
} else {
  document.addEventListener("DOMContentLoaded", function() {
    const currentElement = document.activeElement;
    showMarkerOnEditor(currentElement);
    clickOnEditor(currentElement);
  });
}

// observe the active element to show the marker
document.addEventListener(
  "active-element",
  function(event) {
    // event.detail.focus: element that received focus
    // event.detail.blur: element that lost focus
    log.info("active-element", event);
    const { focus: focusElement } = event.detail;
    showMarkerOnEditor(focusElement);
    clickOnEditor(focusElement);
  },
  false
);

const handle = ally.event.activeElement();
