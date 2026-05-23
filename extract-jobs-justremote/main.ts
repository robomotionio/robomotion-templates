import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d5', 'Extract Jobs JustRemote', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.feed_url = 'https://justremote.co/remote-jobs';
        msg.csv_path = global.get('$Home$') + '/extract-jobs-justremote.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open JustRemote', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('feed_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Jobs', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"JobItemWrapper")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('div[class*="JobItemWrapper"]');
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var titleEl = it.querySelector('h3[class*="JobTitle"]');
          var companyEl = it.querySelector('div[class*="JobItemCompany"]');
          var typeEl = it.querySelector('div[class*="Tag"]');
          var dateEl = it.querySelector('div[class*="JobItemDate"]');
          rows.push({
            'Position': '#' + (i + 1),
            'Company Name': companyEl ? companyEl.innerText.trim() : '',
            'Job Title': titleEl ? titleEl.innerText.trim() : '',
            'Job Type': typeEl ? typeEl.innerText.trim() : '',
            'Date Posted': dateEl ? dateEl.innerText.trim() : ''
          });
        }
        var columns = ['Position','Company Name','Job Title','Job Type','Date Posted'];
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
