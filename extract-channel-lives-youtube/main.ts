import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';
flow.create('z3a4b5c', 'Extract Channel Lives YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Streams URL', { inText: Custom('Enter YouTube channel streams URL (e.g. https://www.youtube.com/@Google/streams)'), outText: Message('url') })
    .then('222222', 'Core.Programming.Function', 'Setup', { func: `msg.csv_path = global.get('$Home$') + '/extract-channel-lives-youtube.csv'; return msg;` })
    .then('333333', 'Core.Browser.Open', 'Open Browser', { optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id') })
    .then('444444', 'Core.Browser.OpenLink', 'Open Page', { inBrowserId: Message('browser_id'), inUrl: Message('url'), outPageId: Message('page_id') })
    .then('555555', 'Core.Browser.WaitElement', 'Wait', { inPageId: Message('page_id'), inSelector: Custom('//ytd-app'), optTimeout: Custom('20') })
    .then('666666', 'Core.Browser.RunScript', 'Extract', { inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        var items = [];
        try {
          var tabs = yd.contents.twoColumnBrowseResultsRenderer.tabs;
          for (var t=0;t<tabs.length;t++) {
            var tab = tabs[t].tabRenderer;
            if (!tab||!tab.selected) continue;
            var contents = (tab.content.richGridRenderer||{}).contents||[];
            for (var i=0;i<contents.length&&items.length<25;i++) {
              var ri = (contents[i].richItemRenderer||{}).content;
              var vr = ri ? (ri.videoRenderer||null) : null;
              if (!vr) continue;
              var title = vr.title && vr.title.runs ? vr.title.runs[0].text : '';
              var views = vr.viewCountText ? (vr.viewCountText.simpleText||'') : '';
              var date = vr.publishedTimeText ? vr.publishedTimeText.simpleText : '';
              if (title) items.push({'Position':'#'+(items.length+1),'Title':title,'Views':views,'Date':date,'Duration':''});
            }
          }
        } catch(e) {}
        return JSON.stringify({columns:['Position','Title','Views','Date','Duration'],rows:items});
      `, outResult: Message('table_json') })
    .then('777777', 'Core.Programming.Function', 'Parse', { func: `msg.table = JSON.parse(msg.table_json); return msg;` })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', { inFilePath: Message('csv_path'), inTable: Message('table'), optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true })
    .then('999999', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
