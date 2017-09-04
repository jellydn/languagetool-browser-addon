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
const MARGIN_TO_CORNER = 8;
const toggleState = {};
let textareaCounter = 0;
let activeTextarea;

function insertLanguageToolIcon(element) {
  console.warn("insertLanguageToolIcon", element);
  const { offsetLeft, offsetTop, offsetHeight, offsetWidth } = element;
  const btns = [
    remindLanguageToolButton(showRemindMenu, {
      offsetLeft,
      offsetTop,
      offsetHeight,
      offsetWidth
    }),
    checkLanguageErrorButton(checkErrorMenu, textareaCounter, {
      offsetLeft,
      offsetTop,
      offsetHeight,
      offsetWidth
    }),
    disableLanguageToolButton(disableMenu, textareaCounter, {
      offsetLeft,
      offsetTop,
      offsetHeight,
      offsetWidth
    })
  ];
  textAreaWrapper(element, btns);
}

/** event hanlders */

function showRemindMenu(evt) {
  const targetId = evt.target.id;
  console.log("ok - show remind menu", targetId);
  const counter = Number(targetId.substr(PREFIX_REMIND.length));
  toggleState[counter] = !toggleState[counter];
  console.log("ok - counter", counter, toggleState);
  const checkBtn = document.getElementById(PREFIX_CHECK + counter);
  const disableBtn = document.getElementById(PREFIX_DISABLE + counter);
  if (toggleState[counter]) {
    if (checkBtn) {
      checkBtn.style.display = "block";
    }
    if (disableBtn) {
      disableBtn.style.display = "block";
    }
  } else {
    if (checkBtn) {
      checkBtn.style.display = "none";
    }
    if (disableBtn) {
      disableBtn.style.display = "none";
    }
  }
}

function checkErrorMenu(evt) {
  console.warn("checkErrorMenu", evt);
}

function disableMenu() {
  const btns = document.getElementsByClassName(REMIND_WRAPPER_CLASS);
  console.warn("disableMenu btns", btns);
  for (let counter = 0; counter < btns.length; counter += 1) {
    const btn = btns[counter];
    btn.parentNode.removeChild(btn);
  }
}

/** DOM manupulate */

function remindLanguageToolButton(clickHandler, position) {
  console.warn("remindLanguageToolButton position", position);
  const { offsetHeight, offsetWidth } = position;
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
  btn.style.top = offsetHeight - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.left = offsetWidth - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.backgroundColor = "#afafed";
  btn.style.borderRadius = "50%";
  btn.style.color = "#fff";
  btn.style.fontSize = "1rem";
  return btn;
}

function checkLanguageErrorButton(clickHandler, counter, position) {
  const { offsetHeight, offsetWidth } = position;
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
  btn.style.top = offsetHeight - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.left = offsetWidth - btnSize - MARGIN_TO_CORNER - 65 + "px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.paddingLeft = "5px";
  btn.style.paddingRight = "5px";
  btn.style.backgroundColor = "#afafed";
  btn.style.color = "#fff";
  btn.style.width = "50px";
  btn.style.fontSize = "1rem";
  return btn;
}

function disableLanguageToolButton(clickHandler, counter, position) {
  const { offsetHeight, offsetWidth } = position;
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
  btn.style.top = offsetHeight - btnSize - MARGIN_TO_CORNER + "px";
  btn.style.left = offsetWidth - btnSize - MARGIN_TO_CORNER - 140 + "px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.paddingLeft = "5px";
  btn.style.paddingRight = "5px";
  btn.style.backgroundColor = "#afafed";
  btn.style.color = "#fff";
  btn.style.width = "60px";
  btn.style.fontSize = "1rem";
  return btn;
}

function textAreaWrapper(textElement, btnElements) {
  const wrapper = document.createElement("div");
  const parent = textElement.parentNode;
  wrapper.className = REMIND_WRAPPER_CLASS;
  wrapper.id =
    "textarea-wrapper-" +
    (textElement.name || textElement.id) +
    "-" +
    Date.now();
  wrapper.style.position = "relative";
  for (const btnElement of btnElements) {
    wrapper.appendChild(btnElement);
  }
  parent.insertBefore(wrapper, textElement);
}

function triggerMarker() {
  if (activeTextarea) {
    // turn off marker
    disableMenu();
  }
  activeTextarea = document.activeElement;
  if (activeTextarea) {
    insertLanguageToolIcon(activeTextarea);
  }
}

function attachEventListenersForTextarea() {
  console.log("attachEventListenersForTextarea");
  const textareaElements = document.getElementsByTagName("textarea");
  console.log("insertLanguageToolIcon", textareaElements);
  for (let counter = 0; counter < textareaElements.length; counter += 1) {
    // insertLanguageToolIcon(textareaElements[counter]);
    const textElement = textareaElements[counter];
    textElement.addEventListener("mouseup", triggerMarker, false);
  }
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
