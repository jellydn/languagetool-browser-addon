/* LanguageTool WebExtension
 * Copyright (C) 2015 Daniel Naber (http://www.danielnaber.de)
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

const trackingBaseUrl =
  "https://openthesaurus.stats.mysnip-hosting.de/piwik.php";
const trackingSiteId = "12";
// chrome.google.com: see http://stackoverflow.com/questions/11613371/
// docs.google.com: Google Docs has a too complicated DOM (but its own add-on framework)
// addons.mozilla.org: see http://stackoverflow.com/questions/42147966/
const unsupportedSitesRegex = /^https?:\/\/(docs.google.com|chrome.google.com|addons.mozilla.org).*/;
const notSupportMarkerSitesRegex = /^https?:\/\/(www.facebook.com|docs.google.com|chrome.google.com|addons.mozilla.org).*/;

class Tools {
  static track(pageUrl, actionName, optionalTrackDetails) {
    if (!Tools.isChrome()) {
      // version with tracking not deployed yet for Firefox, so make it explicit that tracking on FF won't work:
      return;
    }
    try {
      const storage = Tools.getStorage();
      storage.get(
        {
          uid: null
        },
        items => {
          // needed to tell visits from  unique visitors:
          let uid;
          if (items.uid) {
            const { uid: uuid } = items;
            uid = uuid;
          } else {
            uid = this.getRandomToken();
            storage.set({ uid }, () => {});
          }
          if (pageUrl) {
            const shortenedUrl = pageUrl.replace(/^(.*?:\/\/.+?)[?/].*/, "$1"); // for privacy reasons, only log host
            const url = encodeURIComponent(shortenedUrl);
            const trackingUrl = `${trackingBaseUrl}?idsite=${trackingSiteId}&rec=1&url=${url}&action_name=${encodeURIComponent(
              actionName
            )}&rand=${Date.now()}&apiv=1&_id=${uid}&e_c=Action&e_a=${encodeURIComponent(
              actionName
            )}${optionalTrackDetails
              ? `&e_n=${encodeURIComponent(optionalTrackDetails)}`
              : ""}`;
            log.info("trackingUrl", trackingUrl);
            const trackReq = new XMLHttpRequest();
            trackReq.open("POST", trackingUrl);
            trackReq.onerror = () => {
              log.info("LT add-on tracking failed");
            };
            trackReq.ontimeout = () => {
              log.info("LT add-on tracking failed with timeout");
            };
            trackReq.send();
          }
        }
      );
    } catch (e) {
      log.warn("LT add-on tracking failed: ", e);
    }
  }

  static doNotSupportOnUrl(url) {
    return url.match(unsupportedSitesRegex);
  }

  static doNotShowMarkerOnUrl(url) {
    return url.match(notSupportMarkerSitesRegex);
  }

  static getStorage() {
    // special case for Firefox as long as chrome.storage.sync is defined, but
    // not yet activated by default: https://github.com/languagetool-org/languagetool-browser-addon/issues/97
    return chrome.storage.sync && !Tools.isFirefox()
      ? chrome.storage.sync
      : chrome.storage.local;
  }

  static logOnServer(message, serverUrl) {
    if (serverUrl.indexOf("https://languagetool.org") === -1) {
      // these logging messages are only useful for the LT dev team
      // to improve the add-on, so don't send anywhere else:
      return;
    }
    const req = new XMLHttpRequest();
    req.timeout = 60 * 1000; // milliseconds
    const url = serverUrl + (serverUrl.endsWith("/") ? "log" : "/log");
    req.open("POST", url);
    req.onload = () => {
      // do nothing (also ignore timeout and errors)
    };
    // console.log("Posting to " + url + ": " + message);
    req.send(`message=${encodeURIComponent(message)}`);
  }

  static isFirefox() {
    return navigator.userAgent.indexOf("Firefox/") !== -1;
  }

  static isChrome() {
    return (
      navigator.userAgent.indexOf("Chrome/") !== -1 ||
      navigator.userAgent.indexOf("Chromium/") !== -1
    );
  }

  static escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/>/g, "&gt;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  static startWithLowercase(str) {
    const firstCh = str.charAt(0);
    return (
      firstCh === firstCh.toLowerCase() && firstCh !== firstCh.toUpperCase()
    );
  }

  static startWithUppercase(str) {
    const firstCh = str.charAt(0);
    return (
      firstCh === firstCh.toUpperCase() && firstCh !== firstCh.toLowerCase()
    );
  }

  static lowerCaseFirstChar(str) {
    const firstCh = str.charAt(0);
    return firstCh.toLowerCase() + str.substr(1);
  }

  static getRandomToken() {
    const randomPool = new Uint8Array(8);
    crypto.getRandomValues(randomPool);
    let hex = "";
    for (let i = 0; i < randomPool.length; i += 1) {
      hex += randomPool[i].toString(16);
    }
    return hex;
  }

  // Due to Transifex limited support for Android i18n files, we already have
  // a very complicated i18n setup (see injectTranslations.py) and it seems
  // we're better off just hard-coding the English language names here instead of
  // making the process even more complicated:
  static getLangName(langCode) {
    switch (langCode) {
      case "ast-ES":
        return "Asturian";
      case "be-BY":
        return "Belarusian";
      case "br-FR":
        return "Breton";
      case "ca-ES":
        return "Catalan";
      case "ca-ES-valencia":
        return "Catalan (Valencian)";
      case "zh-CN":
        return "Chinese";
      case "da-DK":
        return "Danish";
      case "nl":
        return "Dutch";
      case "en-US":
        return "English (American)";
      case "en-GB":
        return "English (British)";
      case "en-AU":
        return "English (Australia)";
      case "en-CA":
        return "English (Canada)";
      case "en-NZ":
        return "English (New Zealand)";
      case "en-ZA":
        return "English (South Africa)";
      case "eo":
        return "Esperanto";
      case "fr":
        return "French";
      case "gl-ES":
        return "Galician";
      case "de-DE":
        return "German (German)";
      case "de-AT":
        return "German (Austria)";
      case "de-CH":
        return "German (Switzerland)";
      case "el-GR":
        return "Greek";
      case "is-IS":
        return "Icelandic";
      case "it":
        return "Italian";
      case "ja-JP":
        return "Japanese";
      case "km-KH":
        return "Khmer";
      case "lt-LT":
        return "Lithuanian";
      case "ml-IN":
        return "Malayalam";
      case "fa":
        return "Persian";
      case "pl-PL":
        return "Polish";
      case "pt-PT":
        return "Portuguese (Portugal)";
      case "pt-BR":
        return "Portuguese (Brazil)";
      case "ro-RO":
        return "Romanian";
      case "ru-RU":
        return "Russian";
      case "sk-SK":
        return "Slovak";
      case "sl-SI":
        return "Slovenian";
      case "es":
        return "Spanish";
      case "sv":
        return "Swedish";
      case "tl-PH":
        return "Tagalog";
      case "ta-IN":
        return "Tamil";
      case "uk-UA":
        return "Ukrainian";
      default:
        return langCode;
    }
  }
}

if (typeof module !== "undefined") {
  module.exports = Tools;
}
