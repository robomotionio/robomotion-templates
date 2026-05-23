import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('v9w0x1y', 'Scrape Video Search Result YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search Query', {
      inText: Custom('Enter YouTube search query (e.g. machine learning tutorial)'),
      outText: Message('query')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.search_url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(msg.query);
        msg.csv_path = global.get('$Home$') + '/scrape-video-search-result-youtube.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Search', {
      inBrowserId: Message('browser_id'), inUrl: Message('search_url'), outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait ytd-app', {
      inPageId: Message('page_id'), inSelector: Custom('//ytd-app'), optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Search Results', {
      inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        if (!yd) return JSON.stringify({columns:['Position','Title','Channel Name','Views','Time of Publication'],rows:[]});
        var str = JSON.stringify(yd);
        var videos = [];
        try {
          var contents = yd.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents;
          for (var i=0;i<contents.length;i++) {
            var items = (contents[i].itemSectionRenderer || {}).contents || [];
            for (var j=0;j<items.length;j++) {
              var vr = items[j].videoRenderer;
              if (!vr) continue;
              var title = vr.title && vr.title.runs ? vr.title.runs[0].text : '';
              var chan = vr.ownerText && vr.ownerText.runs ? vr.ownerText.runs[0].text : '';
              var views = vr.viewCountText ? (vr.viewCountText.simpleText || '') : '';
              var time = vr.publishedTimeText ? vr.publishedTimeText.simpleText : '';
              if (title) videos.push({'Position':'#'+(videos.length+1),'Title':title,'Channel Name':chan,'Views':views,'Time of Publication':time});
              if (videos.length >= 20) break;
            }
            if (videos.length >= 20) break;
          }
        } catch(e) {}
        return JSON.stringify({columns:['Position','Title','Channel Name','Views','Time of Publication'],rows:videos});
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
