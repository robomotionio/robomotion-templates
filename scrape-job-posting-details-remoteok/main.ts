import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c00c', 'Scrape Job Posting Details RemoteOK', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://remoteok.com/remote-jobs/remote-crypto-trader-elemental-terra-1130867';
        msg.csv_path = global.get('$Home$') + '/scrape-job-posting-details-remoteok.csv';
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
      inSelector: Custom('//h2'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('h2');
        var tr = titleEl ? titleEl.closest('tr') : null;
        var companyEl = tr ? tr.querySelector('.companyLink, h3') : null;
        var locEls = tr ? tr.querySelectorAll('.location') : [];
        var locParts = [];
        for (var i = 0; i < locEls.length; i++) {
          var t = (locEls[i].innerText || '').replace(/^[^A-Za-z0-9$]+/, '').trim();
          if (t) locParts.push(t);
        }
        var location = locParts.join(' | ');
        var salaryEl = tr ? tr.querySelector('.salary') : null;
        var salary = salaryEl ? salaryEl.innerText.replace(/^[^A-Za-z0-9$]+/, '').trim() : '';
        var tagEls = tr ? tr.querySelectorAll('.tag h3') : [];
        var tags = [];
        for (var j = 0; j < tagEls.length; j++) {
          var tg = (tagEls[j].innerText || '').trim();
          if (tg) tags.push(tg);
        }
        var row = {
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Company': companyEl ? companyEl.innerText.trim() : '',
          'Salary': salary,
          'Location': location,
          'Tags': tags.join(', '),
          'Views': '',
          'Applied': ''
        };
        var columns = ['Job Title','Company','Salary','Location','Tags','Views','Applied'];
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
