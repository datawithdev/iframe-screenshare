'use strict';

export default function (webstoreUrl) {
  if (!window.chrome || !window.chrome.webstore) {
    return; // this method works exclusively on chrome
  }
  const handleMessage = function (event) {
    if (!event || !event.data || event.data.type !== 'getScreen') {
      return;
    }
    const extId = window.sessionStorage.getScreenMediaJSExtensionId;
    if (!extId) {
      return window.chrome.webstore.install(webstoreUrl, function () {
        setTimeout(function () {
          window.sessionStorage.getScreenMediaExtensionId = webstoreUrl.split('/').pop();
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
