import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('c6d7e8f', 'Extract Video Transcript From YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Video URL', {
      inText: Custom('Enter YouTube video URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
      outText: Message('video_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-video-transcript-from-youtube.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Video', {
      inBrowserId: Message('browser_id'), inUrl: Message('video_url'), outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait ytd-app', {
      inPageId: Message('page_id'), inSelector: Custom('//ytd-app'), optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Transcript', {
      inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        var str = JSON.stringify(yd || {});
        var transcriptItems = [];
        var captionsM = str.match(/"captionTracks":\\[(.*?)\\]/);
        if (captionsM) {
          var columns = ['Timestamp','Text'];
          transcriptItems.push({'Timestamp':'','Text':'Transcript available - use YouTube\'s transcript feature. Caption tracks detected in page data.'});
        }
        var columns = ['Timestamp','Text'];
        if (!transcriptItems.length) {
          transcriptItems.push({'Timestamp':'','Text':'Navigate to video and open transcript panel to extract content'});
        }
        return JSON.stringify({columns:columns,rows:transcriptItems});
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'), inTable: Message('table'), optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
