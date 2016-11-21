/* global describe, it, beforeEach, afterEach */

let USE_MOCK_WINDOW = false;
if (typeof window === 'undefined') {
  USE_MOCK_WINDOW = true;
}

import { assert } from 'chai';
import sinon from 'sinon';
import { initializeScreenShare, requestScreenShare } from '../';
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
    this.location = { origin: 'https://examplesrus.com' };
    this.screen = { width: 100, height: 100 };
  }

  addEventListener (event, func) {
    this.on(event, func);
  }

  postMessage (message, source) {
    this.emit('message', { data: message, source });
  }
}

describe('requestScreenShare', function () {
  let sandbox;
  beforeEach(function () {
    if (USE_MOCK_WINDOW) {
      global.window = new Window();
    }
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('runs', function () {
    requestScreenShare();
    assert.ok(true);
  });

  it('will not set up a window event listener for message if not in chrome', function (done) {
    sandbox.spy(window, 'addEventListener');
    window.chrome = null;
    requestScreenShare().then(() => {
      assert.ok(false, 'result should not have resolved');
    }, (err) => {
      assert.ok(err);
      sinon.assert.notCalled(window.addEventListener);
      done();
    });
  });

  it('will immediately call getUserMedia if not in chrome, and getUserMedia exists', function (done) {
    window.navigator = {
      mediaDevices: {
        getUserMedia: () => {}
      }
    };
    window.chrome = null;
    sandbox.stub(window.navigator.mediaDevices, 'getUserMedia', (constraints) => {
      assert.equal(constraints.audio, false);
      assert.equal(constraints.video.mediaSource, 'window');
      done();
    });
    requestScreenShare();
  });

  it('will request screen share via the chrome iframe method and resolve', function (done) {
    const sourceId = '123591911019385';
    const mockStream = {};
    window.navigator = {
      mediaDevices: {
        getUserMedia: () => {}
      }
    };
    window.parent = {
      postMessage: () => {}
    };
    sandbox.stub(window.parent, 'postMessage', function (options) {
      assert.equal(options.type, 'getScreen');
      assert.equal(options.url, window.location.origin);
      window.postMessage({ sourceId });
    });
    sandbox.stub(window.navigator.mediaDevices, 'getUserMedia', function (constraints) {
      assert.equal(constraints.audio, false);
      assert.equal(constraints.video.mandatory.chromeMediaSource, 'desktop');
      assert.equal(constraints.video.mandatory.chromeMediaSourceId, sourceId);
      return Promise.resolve(mockStream);
    });
    requestScreenShare().then((stream) => {
      assert.equal(stream, mockStream);
      done();
    });
  });
});

describe('initializeScreenShare', function () {
  let sandbox;
  beforeEach(function () {
    if (USE_MOCK_WINDOW) {
      global.window = new Window();
    }
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('runs', function () {
    initializeScreenShare();
    assert.ok(true);
  });

  it('will not set up a window event listener for message if not in chrome', function () {
    sandbox.spy(window, 'addEventListener');
    window.chrome = null;
    initializeScreenShare();
    sinon.assert.notCalled(window.addEventListener);
  });

  it('will set up a window event listener for a message if in chrome', function () {
    sandbox.spy(window, 'addEventListener');
    initializeScreenShare();
    sinon.assert.calledOnce(window.addEventListener);
    sinon.assert.calledWithExactly(window.addEventListener, 'message', sinon.match.func);
  });

  describe('the message handler', function () {
    it('will send a message to the chrome extension', function (done) {
      const extensionId = 'id-asdlfkjasdkd';
      const webstoreUrl = `https://test.example/test/${extensionId}`;
      window.sessionStorage.getScreenMediaJSExtensionId = extensionId;
      const windowEvent = {
        type: 'getScreen'
      };
      sandbox.stub(window.chrome.runtime, 'sendMessage', function (extId, data, callback) {
        assert.equal(extId, extensionId);
        assert.equal(data, windowEvent);
        assert.equal(typeof callback, 'function');
        done();
      });
      initializeScreenShare(webstoreUrl);
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
      initializeScreenShare(webstoreUrl);
      window.postMessage({
        type: 'getScreen'
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
      initializeScreenShare(webstoreUrl);
      window.postMessage({
        type: 'getScreen'
      });
    });

    it('will post an error message back if install fails.', function (done) {
      const webstoreUrl = 'https://test.example';
      sandbox.stub(window.chrome.webstore, 'install', function (url, callback) {
        throw new Error('Chrome Web Store installations can only be initated by a user gesture.');
      });
      const frameWindow = {
        postMessage: () => {}
      };
      sandbox.stub(frameWindow, 'postMessage', function (msg) {
        assert.ok(msg.err);
        done();
      });
      initializeScreenShare(webstoreUrl);
      window.postMessage({
        type: 'getScreen'
      }, frameWindow);
    });
  });
});
