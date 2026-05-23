import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d4', 'Extract Jobs Working Nomads', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.feed_url = 'https://www.workingnomads.com/jobs';
        msg.csv_path = global.get('$Home$') + '/extract-jobs-working-nomads.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Working Nomads', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('feed_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Jobs', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@class,"job-desktop")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var anchors = document.querySelectorAll('a.job-desktop');
        var rows = [];
        for (var i = 0; i < anchors.length; i++) {
          var a = anchors[i];
          var titleEl = a.querySelector('h4');
          var companyEl = a.querySelector('.company');
          var categoryEl = a.querySelector('.category');
          var dateEl = a.querySelector('.date');
          rows.push({
            'Position': '#' + (i + 1),
            'Job Title': titleEl ? titleEl.innerText.trim() : '',
            'Company Name': companyEl ? companyEl.innerText.trim() : '',
            'Category': categoryEl ? categoryEl.innerText.trim() : '',
            'Posted Date (ago)': dateEl ? dateEl.innerText.trim() : '',
            'Location': '',
            'Job Type': '',
            'Job Link': a.href,
            'Company Link': '',
            'Tag 1': '',
            'Tag 2': '',
            'Tag 3': ''
          });
        }
        var columns = ['Position','Job Title','Company Name','Category','Posted Date (ago)','Location','Job Type','Job Link','Company Link','Tag 1','Tag 2','Tag 3'];
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
