'use strict';

var index = function (webstoreUrl) {
  if (!window.chrome || !window.chrome.webstore) {
    return; // this method works exclusively on chrome
  }
  var handleMessage = function handleMessage(event) {
    if (!event || !event.data || event.data.type !== 'getScreen') {
      return;
    }
    var extId = window.sessionStorage.getScreenMediaJSExtensionId;
    if (!extId) {
      return window.chrome.webstore.install(webstoreUrl, function () {
        setTimeout(function () {
          window.sessionStorage.getScreenMediaJSExtensionId = webstoreUrl.split('/').pop();
          handleMessage(event);
        }, 2500);
      });
    }
    window.chrome.runtime.sendMessage(extId, event.data, function (data) {
      event.source.postMessage(data, '*');
    });
  };
  window.addEventListener('message', handleMessage);
}

module.exports = index;
