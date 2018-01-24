// @flow
import React, { Component } from 'react';
import html2canvas from 'html2canvas';
import './Cheat.css';

type Props = {};
const electron = require('electron');

export default class Cheat extends Component<Props> {
  props: Props;

  componentDidMount() {
    //
    console.log(this.webview);

    setTimeout(() => {
      console.log('click');

      // this.webview.capturePage((image) => {
      //   const fs = window.require('fs');
      //
      //   console.log(image.getSize());
      //   console.log(image.toBitmap());
      //
      //   fs.writeFile('test.png', image.toPNG({
      //     scaleFactor: 2,
      //   }), (err) => {
      //     if (err) throw err;
      //     console.log('It\'s saved!');
      //   });
      // });

      this.captureWeb();

      this.webview.sendInputEvent({
        type: 'mouseDown', x: 149, y: 409, button: 'left', clickCount: 1
      });
      this.webview.sendInputEvent({
        type: 'mouseUp', x: 149, y: 409, button: 'left', clickCount: 1
      });
    }, 20000);
  }

  getWebviewMeta(cb) {
    const code = `var r = {}; 
        r.pageHeight = window.innerHeight;
        r.pageWidth = window.innerWidth;
        r;`;
    this.webview.executeJavaScript(code, false, (r) => {
      const webviewMeta = {};
      webviewMeta.captureHeight = r.pageHeight;
      webviewMeta.captureWidth = r.pageWidth;
      cb(webviewMeta);
    });
  }

  // Creates an image of the visible area of the WebView
  captureWeb() {
    this.getWebviewMeta((webviewMeta) => {
      const captureRect = {
        x: 0,
        y: 0,
        width: +webviewMeta.captureWidth * electron.screen.getPrimaryDisplay().scaleFactor,
        height: +webviewMeta.captureHeight * electron.screen.getPrimaryDisplay().scaleFactor
      };

      this.webview.capturePage(captureRect, (img) => {
        if (img.isEmpty()) {
          // DIDN’T CAPTURE
          // NOTE - in my application we are manually scrolling the view and timing of the record
          // is an issue - sometimes the captured image is empty, we delay a few hundred ms
          // and capture again
        } else {
          // SAVE YOUR JPEG FILE
          const jpgFile = img.toJPEG(90);

          const fs = window.require('fs');

          fs.writeFile('test_1.png', jpgFile, (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
          });

          const resizedImg = img.resize({ width: img.getSize().width / electron.screen.getPrimaryDisplay().scaleFactor });
          const resizedJpgFile = resizedImg.toJPEG(90);

          fs.writeFile('test_2.png', resizedJpgFile, (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
          });

          const resizedImg2 = img.resize({ width: webviewMeta.captureWidth, height: webviewMeta.captureHeight });
          const resizedJpgFile2 = resizedImg2.toJPEG(90);

          fs.writeFile('test_3.png', resizedJpgFile2, (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
          });
        }
      });
    });
  }


  onMouseMove(e) {
    // this.setState({ x: e.screenX, y: e.screenY });
    console.log(`x: ${e.clientX}, y: ${e.clientY}`);
  }

  render() {
    return (
      <webview
        ref={(webview) => { this.webview = webview; }}
        id="webview"
        className="webview"
        src="https://www.facebook.com/messages/t/555148994835147"
        onMouseMove={this.onMouseMove.bind(this)}
      />
    );
  }
}
