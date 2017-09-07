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
const REMIND_BTN_CLASS = "lt-btn";
const REMIND_WRAPPER_CLASS = "lt-text-wrapper";
const PREFIX_REMIND = "remind-btn-";
const PREFIX_CHECK = "check-lt-err-btn-";
const PREFIX_DISABLE = "disable-lt-btn-";
const PREFIX_ABOUT = "about-lt-btn-";
const MARGIN_TO_CORNER = 8;
const toggleState = {};
let textareaCounter = 0;
let totalTextAreas = 0;
let totalContentEditable = 0;
let disableOnPage = false;

function offset(el) {
  const rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

function insertLanguageToolIcon(element) {
  log.info("insertLanguageToolIcon", element, offset(element));
  const { left, top, offsetHeight, offsetWidth } = element;
  const position = Object.assign({}, offset(element), {
    offsetHeight,
    offsetWidth
  });
  const btns = [
    remindLanguageToolButton(showRemindMenu, position),
    checkLanguageErrorButton(checkErrorMenu, textareaCounter, position),
    disableLanguageToolButton(disableMenu, textareaCounter, position),
    aboutLanguageToolButton(showAbout, textareaCounter, position)
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
  const checkBtn = document.getElementById(PREFIX_CHECK + counter);
  const disableBtn = document.getElementById(PREFIX_DISABLE + counter);
  const aboutBtn = document.getElementById(PREFIX_ABOUT + counter);
  checkBtn.style.display = toggleState[counter] ? "block" : "none";
  disableBtn.style.display = toggleState[counter] ? "block" : "none";
  aboutBtn.style.display = toggleState[counter] ? "block" : "none";
}

function showAbout(evt) {
  log.info("showAbout", evt);
  $.featherlight({
    iframe:
      chrome.runtime.getURL("about.html") + "?pageUrl=" + window.location.href,
    iframeWidth: 300,
    iframeHeight: 250
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
  btn.innerText = "LT";
  // style
  const btnSize = 25;
  btn.style.width = btnSize + "px";
  btn.style.height = btnSize + "px";
  btn.style.lineHeight = btnSize + "px";
  btn.style.textAlign = "center";
  btn.style.position = "absolute";
  btn.style.top = top + offsetHeight - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.left = left + offsetWidth - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.backgroundColor = "#afafed";
  btn.style.borderRadius = "50%";
  btn.style.color = "#fff";
  btn.style.fontSize = "13px";
  btn.style.fontFamily = "sans-serif";
  return btn;
}

function checkLanguageErrorButton(clickHandler, counter, position) {
  const { top, left, offsetHeight, offsetWidth } = position;
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  btn.id = PREFIX_CHECK + counter;
  btn.className = REMIND_BTN_CLASS;
  btn.innerText = "Check";
  // style
  const btnSize = 25;
  btn.style.display = "none";
  btn.style.height = btnSize + "px";
  btn.style.lineHeight = btnSize + "px";
  btn.style.textAlign = "center";
  btn.style.position = "absolute";
  btn.style.top = top + offsetHeight - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.left = left + offsetWidth - btnSize - MARGIN_TO_CORNER - 65 + "px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.paddingLeft = "5px";
  btn.style.paddingRight = "5px";
  btn.style.backgroundColor = "#afafed";
  btn.style.color = "#fff";
  btn.style.width = "50px";
  btn.style.fontSize = "13px";
  btn.style.fontFamily = "sans-serif";
  return btn;
}

function disableLanguageToolButton(clickHandler, counter, position) {
  const { top, left, offsetHeight, offsetWidth } = position;
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  btn.id = PREFIX_DISABLE + counter;
  btn.className = REMIND_BTN_CLASS;
  btn.innerText = "Disable";
  // style
  const btnSize = 25;
  btn.style.display = "none";
  btn.style.height = btnSize + "px";
  btn.style.lineHeight = btnSize + "px";
  btn.style.textAlign = "center";
  btn.style.position = "absolute";
  btn.style.top = top + offsetHeight - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.left = left + offsetWidth - btnSize - MARGIN_TO_CORNER - 140 + "px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.paddingLeft = "5px";
  btn.style.paddingRight = "5px";
  btn.style.backgroundColor = "#afafed";
  btn.style.color = "#fff";
  btn.style.width = "60px";
  btn.style.fontSize = "13px";
  btn.style.fontFamily = "sans-serif";
  return btn;
}

function aboutLanguageToolButton(clickHandler, counter, position) {
  const { top, left, offsetHeight, offsetWidth } = position;
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  btn.id = PREFIX_ABOUT + counter;
  btn.className = REMIND_BTN_CLASS;
  btn.innerText = "About";
  // style
  const btnSize = 25;
  btn.style.display = "none";
  btn.style.height = btnSize + "px";
  btn.style.lineHeight = btnSize + "px";
  btn.style.textAlign = "center";
  btn.style.position = "absolute";
  btn.style.top = top + offsetHeight - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.left = left + offsetWidth - btnSize - MARGIN_TO_CORNER - 215 + "px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.paddingLeft = "5px";
  btn.style.paddingRight = "5px";
  btn.style.backgroundColor = "#afafed";
  btn.style.color = "#fff";
  btn.style.width = "60px";
  btn.style.fontSize = "13px";
  btn.style.fontFamily = "sans-serif";
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

function triggerMarker() {
  log.info(
    "triggerMarker",
    document.activeElement.tagName,
    document.activeElement.contentEditable
  );
  console.trace("who is called this");
  if (activeElement()) {
    // turn off marker
    removeAllButtons();
  }
  log.warn(
    "compare activeElement and document.activeElement",
    activeElement(),
    document.activeElement,
    activeElement === document.activeElement
  );
  if (
    document.activeElement.tagName === "TEXTAREA" ||
    document.activeElement.contentEditable !== "inherit"
  ) {
    setActiveElement(document.activeElement);
    if (
      activeElement() &&
      !isHiddenElement(activeElement()) &&
      !disableOnPage
    ) {
      insertLanguageToolIcon(activeElement());
    }
  } else {
    setActiveElement(null);
  }
}

function isHiddenElement(el) {
  const style = window.getComputedStyle(el);
  return style.display === "none";
}

function attachEventListenersForTextarea() {
  log.info("attachEventListenersForTextarea");
  // find all textarea elemnets
  const textareaElements = document.getElementsByTagName("textarea");
  log.info("insertLanguageToolIcon", textareaElements);
  totalTextAreas = textareaElements.length;
  for (let counter = 0; counter < textareaElements.length; counter += 1) {
    const textElement = textareaElements[counter];
    textElement.addEventListener("mouseup", triggerMarker, false);
    if (textElement === document.activeElement) {
      triggerMarker();
    }
  }

  // find all element base on attribute
  const contentEditableElements = document.querySelectorAll(
    '[contenteditable="true"]'
  );
  totalContentEditable = contentEditableElements.length;
  for (
    let counter = 0;
    counter < contentEditableElements.length;
    counter += 1
  ) {
    const textElement = contentEditableElements[counter];
    textElement.addEventListener("mouseup", triggerMarker, false);
    if (textElement === document.activeElement) {
      triggerMarker();
    }
  }

  // detect on window resize
  window.onresize = function(evt) {
    log.info("resize window", evt);
    triggerMarker();
  };

  // observer the textarea and content editable
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      log.info("mutation", mutation.type, mutation);
      const textareaElements = document.getElementsByTagName("textarea");
      if (totalTextAreas !== textareaElements.length) {
        for (
          let counter = totalTextAreas;
          counter < textareaElements.length;
          counter += 1
        ) {
          const textElement = textareaElements[counter];
          log.info("textElement", textElement);
          if (textElement) {
            textElement.addEventListener("mouseup", triggerMarker, false);
            if (textElement === document.activeElement) {
              triggerMarker();
            }
          }
        }
        totalTextAreas = textareaElements.length;
      }
      const contentEditableElements = document.querySelectorAll(
        '[contenteditable="true"]'
      );
      if (totalContentEditable !== contentEditableElements.length) {
        for (
          let counter = totalContentEditable;
          counter < contentEditableElements.length;
          counter += 1
        ) {
          const textElement = contentEditableElements[counter];
          log.info("textElement", textElement);
          if (textElement) {
            textElement.addEventListener("mouseup", triggerMarker, false);
            if (textElement === document.activeElement) {
              triggerMarker();
            }
          }
        }
        totalContentEditable = contentEditableElements.length;
      }
    });
  });

  // configuration of the observer:
  const config = { childList: true };

  // pass in the target node, as well as the observer options
  observer.observe(document.body, config);
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  attachEventListenersForTextarea();
} else {
  document.addEventListener(
    "DOMContentLoaded",
    attachEventListenersForTextarea
  );
}
