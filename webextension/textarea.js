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

function insertLanguageToolIcon() {
  console.log("insertLanguageToolIcon");
  const textareaElements = document.getElementsByTagName("textarea");
  for (let counter = 0; counter < textareaElements.length; counter += 1) {
    const element = textareaElements[counter];
    console.warn("textarea", element, element.parentNode);
    const btn = remindLanguageToolButton(showRemindMenu);
    textAreaWrapper(element, btn);
  }
}

function showRemindMenu() {
  alert("ok - show remind menu");
}

function remindLanguageToolButton(clickHandler) {
  const btn = document.createElement("A");
  btn.onclick = clickHandler;
  btn.className = "lt-remind-btn";
  btn.innerText = "LT";
  // style
  btn.style.width = "25px";
  btn.style.height = "25px";
  btn.style.lineHeight = "25px";
  btn.style.textAlign = "center";
  btn.style.position = "absolute";
  btn.style.bottom = "10px";
  btn.style.right = "10px";
  btn.style.zIndex = 1000;
  btn.style.cursor = "pointer";
  btn.style.backgroundColor = "#afafed";
  btn.style.borderRadius = "50%";
  return btn;
}

function textAreaWrapper(textElement, btnElement) {
  const wrapper = document.createElement("div");
  const parent = textElement.parentNode;
  wrapper.id =
    "textarea-wrapper-" +
    (textElement.name || textElement.id) +
    "-" +
    Date.now();
  wrapper.style.position = "relative";
  parent.replaceChild(wrapper, textElement);
  wrapper.appendChild(textElement);
  wrapper.insertBefore(btnElement, textElement);
}

insertLanguageToolIcon();
