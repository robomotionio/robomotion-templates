import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('u8v9w0x', 'Scrape YouTube Video Info', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Video URL', {
      inText: Custom('Enter YouTube video URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
      outText: Message('video_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/scrape-youtube-video-info.csv'; return msg;`
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
    .then('666666', 'Core.Browser.RunScript', 'Extract Video Info', {
      inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        var yp = window.ytInitialPlayerConfig;
        if (!yd) return JSON.stringify({columns:['Video Title','Channel URL','Subscriber Count','View Count','Like Count','Published Date','Duration','Description'],rows:[]});
        var str = JSON.stringify(yd);
        var titleM = str.match(/"title":\\{"runs":\\[\\{"text":"([^"]+)"/);
        var title = titleM ? titleM[1] : '';
        var viewsM = str.match(/"viewCount":\\{"videoViewCountRenderer":\\{"viewCount":\\{"simpleText":"([^"]+)"/);
        var views = viewsM ? viewsM[1] : '';
        var likesM = str.match(/"accessibilityText":"([0-9,]+ likes?)"/);
        var likes = likesM ? likesM[1] : '';
        var dateM = str.match(/"dateText":\\{"simpleText":"([^"]+)"/);
        var date = dateM ? dateM[1] : '';
        var chanM = str.match(/"channelName":"([^"]+)"/);
        var chan = chanM ? chanM[1] : '';
        var descM = str.match(/"shortDescription":"([^"]{0,300})"/);
        var desc = descM ? descM[1] : '';
        var columns = ['Video Title','Channel URL','Subscriber Count','View Count','Like Count','Published Date','Duration','Description'];
        var rows = [{'Video Title':title,'Channel URL':location.href.replace(/watch.*$/,''),'Subscriber Count':'','View Count':views,'Like Count':likes,'Published Date':date,'Duration':'','Description':desc}];
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
