import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';
flow.create('y2z3a4b', 'Extract Channel Shorts YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Shorts URL', { inText: Custom('Enter YouTube channel shorts URL (e.g. https://www.youtube.com/@Google/shorts)'), outText: Message('url') })
    .then('222222', 'Core.Programming.Function', 'Setup', { func: `msg.csv_path = global.get('$Home$') + '/extract-channel-shorts-youtube.csv'; return msg;` })
    .then('333333', 'Core.Browser.Open', 'Open Browser', { optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id') })
    .then('444444', 'Core.Browser.OpenLink', 'Open Page', { inBrowserId: Message('browser_id'), inUrl: Message('url'), outPageId: Message('page_id') })
    .then('555555', 'Core.Browser.WaitElement', 'Wait', { inPageId: Message('page_id'), inSelector: Custom('//ytd-app'), optTimeout: Custom('20') })
    .then('666666', 'Core.Browser.RunScript', 'Extract', { inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        var items = [];
        try {
          var str = JSON.stringify(yd);
          var tabs = yd.contents.twoColumnBrowseResultsRenderer.tabs;
          for (var t=0;t<tabs.length;t++) {
            var tab = tabs[t].tabRenderer;
            if (!tab||!tab.selected) continue;
            var contents = (tab.content.richGridRenderer||{}).contents||[];
            for (var i=0;i<contents.length&&items.length<25;i++) {
              var ri = (contents[i].richItemRenderer||{}).content;
              var sr = ri ? (ri.shortsLockupViewModel||ri.videoRenderer||null) : null;
              if (!sr) continue;
              var title = sr.title ? (sr.title.accessibility ? sr.title.accessibility.accessibilityData.label : (sr.title.runs ? sr.title.runs[0].text : '')) : '';
              var views = sr.viewCountText ? (sr.viewCountText.simpleText||'') : '';
              if (title) items.push({'Position':'#'+(items.length+1),'Title':title,'Views':views,'Duration':'','Link':''});
            }
          }
        } catch(e) {}
        return JSON.stringify({columns:['Position','Title','Views','Duration','Link'],rows:items});
      `, outResult: Message('table_json') })
    .then('777777', 'Core.Programming.Function', 'Parse', { func: `msg.table = JSON.parse(msg.table_json); return msg;` })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', { inFilePath: Message('csv_path'), inTable: Message('table'), optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true })
    .then('999999', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
