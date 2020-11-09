const s = document.createElement("script");
s.src = chrome.extension.getURL("content/intercept.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
