import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c00e', 'Scrape Job Posting Details Seek', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://www.seek.com.au/job/91286070';
        msg.csv_path = global.get('$Home$') + '/scrape-job-posting-details-seek.csv';
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
      inSelector: Custom('//*[@data-automation="job-detail-title"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('[data-automation="job-detail-title"]');
        var companyEl = document.querySelector('[data-automation="advertiser-name"]');
        var descEl = document.querySelector('[data-automation="jobAdDetails"]');
        var spans = document.querySelectorAll('span');
        var posted = '';
        for (var i = 0; i < spans.length; i++) {
          var t = (spans[i].innerText || '').trim();
          if (t.indexOf('Posted ') === 0 && t.length < 40) { posted = t.replace(/^Posted\\s+/, ''); break; }
        }
        var description = descEl ? descEl.innerText.replace(/\\s+/g, ' ').trim().substr(0, 1500) : '';
        var row = {
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Company Name': companyEl ? companyEl.innerText.trim() : '',
          'Description': description,
          'Posted time': posted,
          'Company Link': window.location.href
        };
        var columns = ['Job Title','Company Name','Description','Posted time','Company Link'];
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
