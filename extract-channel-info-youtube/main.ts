import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('t7u8v9w', 'Extract Channel Info YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Channel URL', {
      inText: Custom('Enter YouTube channel URL (e.g. https://www.youtube.com/@Google)'),
      outText: Message('channel_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-channel-info-youtube.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Channel', {
      inBrowserId: Message('browser_id'), inUrl: Message('channel_url'), outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait ytd-app', {
      inPageId: Message('page_id'),
      inSelector: Custom('//ytd-app'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Channel Info', {
      inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        if (!yd) return JSON.stringify({columns:['Channel Name','Channel ID','Subscribers','Videos','Logo'],rows:[]});
        var meta = (yd.metadata || {}).channelMetadataRenderer || {};
        var headerStr = JSON.stringify(yd.header || {});
        var subsM = headerStr.match(/"content":"([0-9.]+[KMB]? subscribers?)"/);
        var videosM = headerStr.match(/"[0-9,]+ videos?"/);
        var logoM = headerStr.match(/"url":"(https:\\/\\/yt3\\.ggpht\\.com[^"]+)"/);
        var columns = ['Channel Name','Channel ID','Subscribers','Videos','Logo'];
        var rows = [{'Channel Name':meta.title||'','Channel ID':meta.externalId||'','Subscribers':subsM?subsM[1]:'','Videos':videosM?videosM[0]:'','Logo':logoM?logoM[1]:''}];
        return JSON.stringify({columns:columns,rows:rows});
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
