import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c007', 'Extract Search Results Workable', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.search_url = msg.search_url || 'https://jobs.workable.com/search?query=engineer';
        msg.csv_path = global.get('$Home$') + '/extract-search-results-workable.csv';
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
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"jobCard__container")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('div[class*="jobCard__container"]');
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var titleEl = c.querySelector('h2[class*="jobCardDetails__job-title"]');
          var linkEl = c.querySelector('a[href]');
          var companyEl = c.querySelector('h3[class*="companyName__container"]');
          var details = c.querySelectorAll('span[class*="jobDetails__job-detail"]');
          var dateEl = c.querySelector('span[class*="date-posted"]');
          var jobType = details.length > 0 ? details[0].innerText.trim() : '';
          var location = details.length > 1 ? details[1].innerText.trim() : '';
          var employmentType = details.length > 2 ? details[2].innerText.trim() : '';
          var company = companyEl ? companyEl.innerText.replace(/^at\\s+/, '').trim() : '';
          var link = linkEl ? linkEl.href : '';
          rows.push({
            'Position': '#' + (i + 1),
            'Job Name': titleEl ? titleEl.innerText.trim() : '',
            'Job Link': link,
            'Type': jobType,
            'Location': location,
            'Employment Type': employmentType,
            'Company Name': company,
            'Date Posted': dateEl ? dateEl.innerText.replace(/^Posted\\s+/, '').trim() : ''
          });
        }
        var columns = ['Position','Job Name','Job Link','Type','Location','Employment Type','Company Name','Date Posted'];
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
