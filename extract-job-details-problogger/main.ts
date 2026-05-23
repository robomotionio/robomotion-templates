import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c005', 'Extract Job Details ProBlogger', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://problogger.com/jobs/job/continuing-a-sci-fi-novel-series-full-outlines-given/';
        msg.csv_path = global.get('$Home$') + '/extract-job-details-problogger.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Job', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('job_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Title', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1[contains(@class,"title")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('h1.title');
        var companyEl = document.querySelector('.wpjb-top-header-title');
        var subEl = document.querySelector('.wpjb-top-header-subtitle');
        var rows = document.querySelectorAll('.wpjb-grid-row');
        var byLabel = {};
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var cols = r.querySelectorAll('.wpjb-grid-col');
          if (cols.length >= 2) {
            var label = (cols[0].innerText || '').trim();
            var value = (cols[1].innerText || '').replace(/\\s+/g, ' ').trim();
            if (label) byLabel[label.toLowerCase()] = value;
          }
        }
        var datePosted = '';
        if (subEl) {
          datePosted = subEl.innerText.replace(/^Published[:\\s]*/i, '').trim();
        }
        var company = '';
        if (companyEl) {
          company = companyEl.innerText.replace(/\\s+/g, ' ').trim();
        }
        var row = {
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Company': company,
          'Location': byLabel['location'] || '',
          'Job Type': byLabel['job type'] || '',
          'Date Posted': datePosted
        };
        var columns = ['Job Title','Company','Location','Job Type','Date Posted'];
        return JSON.stringify({ columns: columns, rows: [row] });
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
