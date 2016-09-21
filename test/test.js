/* global describe, it, beforeEach */

if (typeof window === 'undefined') {
  GLOBAL.window = {
    chrome: {
      webstore: {
        install: () => {}
      }
    }
  };
}

import { assert } from 'chai';
// import sinon from 'sinon';
// import screenShare from '../src/index';

describe('screenShare', function () {
  beforeEach(function () {

  });

  describe('screenShare', function () {
    it('runs', function () {
      assert.ok(true);
    });
  });
});
