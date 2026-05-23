import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c00d', 'Extract Job Postings List Seek', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.list_url = msg.list_url || 'https://www.seek.com.au/jobs';
        msg.csv_path = global.get('$Home$') + '/extract-job-postings-list-seek.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open List', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('list_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//article[@data-card-type="JobCard"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('article[data-card-type="JobCard"]');
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var titleEl = c.querySelector('a[data-automation="jobTitle"]');
          var title = titleEl ? titleEl.innerText.trim() : (c.getAttribute('aria-label') || '');
          var companyEl = c.querySelector('[data-automation="jobCompany"]');
          var locEl = c.querySelector('[data-automation="jobLocation"]');
          var salEl = c.querySelector('[data-automation="jobSalary"]');
          var dateEl = c.querySelector('[data-automation="jobListingDate"]');
          rows.push({
            'Position': '#' + (i + 1),
            'Job Title': title,
            'Company Name': companyEl ? companyEl.innerText.trim() : '',
            'Location': locEl ? locEl.innerText.trim() : '',
            'Salary': salEl ? salEl.innerText.trim() : '',
            'Listing Date': dateEl ? dateEl.innerText.trim() : ''
          });
        }
        var columns = ['Position','Job Title','Company Name','Location','Salary','Listing Date'];
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
