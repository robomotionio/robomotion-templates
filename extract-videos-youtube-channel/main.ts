import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('w0x1y2z', 'Extract Videos YouTube Channel', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Channel Videos URL', {
      inText: Custom('Enter YouTube channel videos URL (e.g. https://www.youtube.com/@Google/videos)'),
      outText: Message('channel_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-videos-youtube-channel.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Channel Videos', {
      inBrowserId: Message('browser_id'), inUrl: Message('channel_url'), outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait ytd-app', {
      inPageId: Message('page_id'), inSelector: Custom('//ytd-app'), optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Videos', {
      inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        if (!yd) return JSON.stringify({columns:['Position','Title','Views','Date','Duration'],rows:[]});
        var videos = [];
        try {
          var tabs = yd.contents.twoColumnBrowseResultsRenderer.tabs;
          for (var t=0;t<tabs.length;t++) {
            var tab = tabs[t].tabRenderer;
            if (!tab || !tab.selected) continue;
            var contents = (tab.content.richGridRenderer || {}).contents || [];
            for (var i=0;i<contents.length && videos.length<25;i++) {
              var vr = (contents[i].richItemRenderer || {}).content;
              if (!vr) continue;
              var vrid = vr.videoRenderer || vr.shortsLockupViewModel;
              if (!vrid) continue;
              var title = vrid.title && vrid.title.runs ? vrid.title.runs[0].text : (vrid.title && vrid.title.accessibility ? vrid.title.accessibility.accessibilityData.label : '');
              var views = vrid.viewCountText ? (vrid.viewCountText.simpleText || '') : '';
              var date = vrid.publishedTimeText ? vrid.publishedTimeText.simpleText : '';
              var dur = vrid.lengthText ? (vrid.lengthText.simpleText || '') : '';
              if (title) videos.push({'Position':'#'+(videos.length+1),'Title':title,'Views':views,'Date':date,'Duration':dur});
            }
          }
        } catch(e) {}
        return JSON.stringify({columns:['Position','Title','Views','Date','Duration'],rows:videos});
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
