# iFrame Screenshare
[![Build Status][1]][2] [![npm version][5]][6]

## Purpose

Google Chrome uses the [`chrome.desktopCapture`][3] extension API to enable
capturing screens or windows (which can then be used in combination with WebRTC)
for screen sharing. In order to use these APIs to enable screen capture from a
cross-origin iframe, it's less straightforward. This package does the work of
implementing the logic for messaging between parent and frame windows, and
between the parent window and the chrome extension. It also goes a step forward
with logic for inline installation via the chrome runtime API.

### Example

A consumer facing website for a company called Examples'ᴙ'Us at
`https://examplesrus.com` embeds PureCloud (at `https://mypurecloud.com`) in a
popover frame for enabling customer service chat and screen sharing. Because
Chrome requires an extension for screen capture, Examples'ᴙ'Us wants the
extension to be branded for their company, not for PureCloud, because *their
customers* should associate it with them, not with PureCloud. Thus,
Examples'ᴙ'Us deploys a branded (whitelabel) extension to the Chrome WebStore,
and uses iframe-screenshare to connect the wires.


### How it works

Take our previous example: Examples'ᴙ'Us branded extension enabling screen
capture for screen sharing in an embedded PureCloud popover iframe.

![iframe-screenshare][4]

## API

#### Parent Window
```javascript
// webstore url for inline installation is optional
const webstoreUrl = 'https://chrome.google.com/webstore/detail/hkgejheiebikekdmadhjgohfofafldbe';

import { initializeScreenShare } from 'iframe-screenshare';
// or `const { initializeScreenShare } = require('iframe-screenshare');`
initializeScreenShare(webstoreUrl);

```

or

```html
<script src="/iframe-screenshare.min.js" type="text/javascript"></script>
<script type="text/javascript">
  iframeScreenshare.initializeScreenShare()
</script>
```

#### Child Frame
```javascript
import { requestScreenShare } from 'iframe-screenshare';
// or `const { requestScreenShare } = require('iframe-screenshare');`
requestScreenShare();

```

or

```html
<script src="/iframe-screenshare.min.js" type="text/javascript"></script>
<script type="text/javascript">
  iframeScreenshare.requestScreenShare()
</script>
```

[1]:https://travis-ci.org/MyPureCloud/iframe-screenshare.svg?branch=master
[2]:https://travis-ci.org/MyPureCloud/iframe-screenshare
[3]:http://chimera.labs.oreilly.com/books/1230000000545/ch18.html
[4]:https://cloud.githubusercontent.com/assets/833911/18876974/b1c8da72-8499-11e6-95c3-650952c80e4f.png
[5]:https://badge.fury.io/js/iframe-screenshare.svg
[6]:https://badge.fury.io/js/iframe-screenshare
