/* global describe, it, beforeEach, afterEach */

let USE_MOCK_WINDOW = false;
if (typeof window === 'undefined') {
  USE_MOCK_WINDOW = true;
}

import { assert } from 'chai';
import sinon from 'sinon';
import screenShare from '../out/iframe-screenshare.min.js';
import { EventEmitter } from 'events';

class Window extends EventEmitter {
  constructor () {
    super();
    this.chrome = {
      webstore: {
        install: () => {}
      },
      runtime: {
        sendMessage: () => {}
      }
    };
    this.sessionStorage = {};
  }

  addEventListener (event, func) {
    this.on(event, func);
  }

  postMessage (message) {
    this.emit('message', message);
  }
}

describe('screenShare', function () {
  let sandbox;
  beforeEach(function () {
    if (USE_MOCK_WINDOW) {
      GLOBAL.window = new Window();
    }
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('runs', function () {
    screenShare();
    assert.ok(true);
  });

  it('will not set up a window event listener for message if not in chrome', function () {
    sandbox.spy(window, 'addEventListener');
    window.chrome = null;
    screenShare();
    sinon.assert.notCalled(window.addEventListener);
  });

  it('will set up a window event listener for a message if in chrome', function () {
    sandbox.spy(window, 'addEventListener');
    screenShare();
    sinon.assert.calledOnce(window.addEventListener);
    sinon.assert.calledWithExactly(window.addEventListener, 'message', sinon.match.func);
  });

  describe('the message handler', function () {
    it('will send a message to the chrome extension', function (done) {
      const extensionId = 'id-asdlfkjasdkd';
      const webstoreUrl = `https://test.example/test/${extensionId}`;
      window.sessionStorage.getScreenMediaJSExtensionId = extensionId;
      const windowEvent = {
        data: {
          type: 'getScreen'
        }
      };
      sandbox.stub(window.chrome.runtime, 'sendMessage', function (extId, data, callback) {
        assert.equal(extId, extensionId);
        assert.equal(data, windowEvent.data);
        assert.equal(typeof callback, 'function');
        done();
      });
      screenShare(webstoreUrl);
      window.postMessage(windowEvent);
    });

    it('will attempt to install the chrome extension if it does not exist, then send the message to the extension', function (done) {
      this.timeout(3000); // the install process has a timeout of 2500

      const webstoreUrl = 'https://test.example';
      sandbox.stub(window.chrome.webstore, 'install', function (url, callback) {
        assert.equal(url, webstoreUrl);
        assert.equal(typeof callback, 'function');
        callback();
      });
      sandbox.stub(window.chrome.runtime, 'sendMessage', function () {
        done();
      });
      screenShare(webstoreUrl);
      window.postMessage({
        data: {
          type: 'getScreen'
        }
      });
    });

    it('will not attempt to install the chrome extension if it appears to exist', function (done) {
      const webstoreUrl = 'https://test.example';
      sandbox.stub(window.chrome.webstore, 'install', function (url, callback) {
        assert.ok(false, 'chrome webstore install should not have been called');
      });
      sandbox.stub(window.chrome.runtime, 'sendMessage', function () {
        sinon.assert.notCalled(window.chrome.webstore.install);
        done();
      });
      window.sessionStorage.getScreenMediaJSExtensionId = '1234';
      screenShare(webstoreUrl);
      window.postMessage({
        data: {
          type: 'getScreen'
        }
      });
    });
  });
});
