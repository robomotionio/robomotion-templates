import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d7', 'Extract Jobs Dribbble', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.feed_url = 'https://dribbble.com/jobs';
        msg.csv_path = global.get('$Home$') + '/extract-jobs-dribbble.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Dribbble Jobs', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('feed_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Jobs', {
      inPageId: Message('page_id'),
      inSelector: Custom('//li[contains(@class,"job-list-item")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('li.job-list-item');
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var li = items[i];
          var titleEl = li.querySelector('.job-board-job-title') || li.querySelector('.job-title');
          var companyEl = li.querySelector('.job-board-job-company');
          var linkA = li.querySelector('a.job-link');
          var img = li.querySelector('.company-avatar img');
          var lines = li.innerText.split('\\n').map(function(s){return s.trim();}).filter(function(s){return s;});
          var dateText = '';
          var locText = '';
          for (var k = 0; k < lines.length; k++) {
            var t = lines[k];
            if (t.indexOf('Posted ') === 0 || /\\d+\\s+(hour|day|week|month)/i.test(t)) dateText = t;
          }
          if (lines.length > 0) locText = lines[lines.length - 1];
          rows.push({
            'Position': '#' + (i + 1),
            'Job Title': titleEl ? titleEl.innerText.trim() : '',
            'Company Name': companyEl ? companyEl.innerText.trim() : '',
            'Location': locText,
            'Posted Date (ago)': dateText,
            'Job Link': linkA ? linkA.href : '',
            'Company Logo': img ? img.src : ''
          });
        }
        var columns = ['Position','Job Title','Company Name','Location','Posted Date (ago)','Job Link','Company Logo'];
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
