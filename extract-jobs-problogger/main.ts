import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d6', 'Extract Jobs ProBlogger', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.feed_url = 'https://problogger.com/jobs/';
        msg.csv_path = global.get('$Home$') + '/extract-jobs-problogger.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open ProBlogger', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('feed_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Jobs', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"wpjb-grid-row")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var rowsEl = document.querySelectorAll('.wpjb-grid-row');
        var rows = [];
        for (var i = 0; i < rowsEl.length; i++) {
          var r = rowsEl[i];
          var titleA = r.querySelector('.wpjb-col-title .wpjb-line-major a');
          var companyEl = r.querySelector('.wpjb-col-title .wpjb-sub');
          var locCols = r.querySelectorAll('.wpjb-col-location');
          var location = '';
          var jobType = '';
          if (locCols.length > 0) {
            var loc1 = locCols[0];
            var locMaj = loc1.querySelector('.wpjb-line-major');
            var locSub = loc1.querySelector('.wpjb-sub');
            location = locMaj ? locMaj.innerText.trim() : '';
            jobType = locSub ? locSub.innerText.trim() : '';
          }
          rows.push({
            'Position': '#' + (i + 1),
            'Job Title': titleA ? titleA.innerText.trim() : '',
            'Company Name': companyEl ? companyEl.innerText.trim() : '',
            'Location': location,
            'Job Type': jobType
          });
        }
        var columns = ['Position','Job Title','Company Name','Location','Job Type'];
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
