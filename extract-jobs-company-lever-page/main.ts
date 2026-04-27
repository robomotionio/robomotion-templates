import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2cd', 'Extract Jobs Company Lever Page', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.lever_url = msg.lever_url || 'https://jobs.lever.co/leverdemo';
        msg.csv_path = global.get('$Home$') + '/extract-jobs-company-lever-page.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Lever Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('lever_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Postings', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"posting") and not(contains(@class,"posting-apply"))]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var posts = document.querySelectorAll('.posting');
        var rows = [];
        for (var i = 0; i < posts.length; i++) {
          var p = posts[i];
          var titleA = p.querySelector('a.posting-title');
          var name = p.querySelector('h5');
          var workplace = p.querySelector('.workplaceTypes');
          var location = p.querySelector('.location');
          var commitment = p.querySelector('.commitment');
          var clean = function(s) { return (s || '').replace(/—/g, '').trim(); };
          rows.push({
            'Position': '#' + (i + 1),
            'Job Title': name ? name.innerText.trim() : '',
            'Type': workplace ? clean(workplace.innerText) : '',
            'Employment Type': commitment ? commitment.innerText.trim() : '',
            'Location': location ? location.innerText.trim() : '',
            'Job Link': titleA ? titleA.href : ''
          });
        }
        var columns = ['Position','Job Title','Type','Employment Type','Location','Job Link'];
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
