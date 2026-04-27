import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2c5', 'Extract Posts Search Substack', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.query = msg.query || 'artificial intelligence';
        msg.search_url = 'https://substack.com/search/' + encodeURIComponent(msg.query) + '?searching=focused_post';
        msg.csv_path = global.get('$Home$') + '/extract-posts-search-substack.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Results', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@class,"postAttachment")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Posts', {
      inPageId: Message('page_id'),
      func: `
        var anchors = document.querySelectorAll('a[class*="postAttachment"]');
        var rows = [];
        for (var i = 0; i < anchors.length; i++) {
          var a = anchors[i];
          var titleEl = a.querySelector('h4');
          var title = '';
          if (titleEl) {
            title = titleEl.innerText.trim();
          } else {
            var divs = a.querySelectorAll('div');
            var longest = '';
            for (var k = 0; k < divs.length; k++) {
              var d = divs[k];
              if (d.children.length === 0) {
                var t = d.innerText ? d.innerText.trim() : '';
                if (t.length > longest.length) longest = t;
              }
            }
            title = longest;
          }
          var pubEls = a.querySelectorAll('[class*="ellipsis"]');
          var pub = pubEls.length > 0 ? pubEls[pubEls.length - 1].innerText.trim() : '';
          rows.push({
            'Position': '#' + (i + 1),
            'Title': title,
            'Writer': pub,
            "Company's Name": pub,
            'Link': a.href
          });
        }
        var columns = ['Position','Title','Writer',"Company's Name",'Link'];
        return JSON.stringify({ columns: columns, rows: rows });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `
        msg.table = JSON.parse(msg.table_json);
        return msg;
      `
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
