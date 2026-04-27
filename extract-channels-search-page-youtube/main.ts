import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a4b5c6d', 'Extract Channels Search Page YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search Query', {
      inText: Custom('Enter YouTube channel search query (e.g. technology review)'),
      outText: Message('query')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.search_url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(msg.query) + '&sp=EgIQAg%253D%253D';
        msg.csv_path = global.get('$Home$') + '/extract-channels-search-page-youtube.csv';
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
    .then('666666', 'Core.Browser.RunScript', 'Extract Channels', {
      inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        if (!yd) return JSON.stringify({columns:['Position','Channel Name','Subscribers','Description','Channel URL'],rows:[]});
        var channels = [];
        try {
          var contents = yd.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents;
          for (var i=0;i<contents.length;i++) {
            var items = (contents[i].itemSectionRenderer||{}).contents||[];
            for (var j=0;j<items.length&&channels.length<20;j++) {
              var cr = items[j].channelRenderer;
              if (!cr) continue;
              var name = cr.title ? (cr.title.simpleText||'') : '';
              var subs = cr.subscriberCountText ? (cr.subscriberCountText.simpleText||cr.subscriberCountText.accessibility&&cr.subscriberCountText.accessibility.accessibilityData.label||'') : '';
              var desc = cr.descriptionSnippet && cr.descriptionSnippet.runs ? cr.descriptionSnippet.runs[0].text : '';
              var url = cr.channelId ? 'https://www.youtube.com/channel/' + cr.channelId : '';
              if (name) channels.push({'Position':'#'+(channels.length+1),'Channel Name':name,'Subscribers':subs,'Description':desc.substring(0,200),'Channel URL':url});
            }
          }
        } catch(e) {}
        return JSON.stringify({columns:['Position','Channel Name','Subscribers','Description','Channel URL'],rows:channels});
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
