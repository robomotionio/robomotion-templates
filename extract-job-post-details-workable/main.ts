import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c008', 'Extract Job Post Details Workable', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://jobs.workable.com/view/ppgMaqBxLKXY4g3eLpXhXH/hybrid-engineer-in-munich-at-exergy3';
        msg.csv_path = global.get('$Home$') + '/extract-job-post-details-workable.csv';
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
      inSelector: Custom('//h1[contains(@class,"jobOverview__job-title")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('h1[class*="jobOverview__job-title"]');
        var companyEl = document.querySelector('h2[class*="companyName__container"]');
        var details = document.querySelectorAll('span[class*="jobDetails__job-detail"]');
        var dateEl = document.querySelector('span[class*="jobOverview__date-posted"]');
        var location = details.length > 1 ? details[1].innerText.trim() : (details.length > 0 ? details[0].innerText.trim() : '');
        var employmentType = details.length > 2 ? details[2].innerText.trim() : '';
        var company = companyEl ? companyEl.innerText.replace(/^at\\s+/, '').trim() : '';
        var date = dateEl ? dateEl.innerText.replace(/^Posted\\s+/, '').trim() : '';
        var row = {
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Company Name': company,
          'Location': location,
          'Employment Type': employmentType,
          'Date': date
        };
        var columns = ['Job Title','Company Name','Location','Employment Type','Date'];
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
