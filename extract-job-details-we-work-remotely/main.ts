import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c003', 'Extract Job Details WWR', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://weworkremotely.com/remote-jobs/aurelian-sovereign-virtual-real-estate-sales-representative-remote';
        msg.csv_path = global.get('$Home$') + '/extract-job-details-we-work-remotely.csv';
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
      inSelector: Custom('//h1[contains(@class,"company-info__title")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('h1[class*="company-info__title"]');
        var companyEl = document.querySelector('div[class*="companyDetails__info__title"]');
        var items = document.querySelectorAll('li[class*="job-about__list__item"]');
        var posted = '', jobType = '', location = '';
        for (var i = 0; i < items.length; i++) {
          var t = items[i].innerText.replace(/\\s+/g, ' ').trim();
          if (t.indexOf('Posted on') === 0) posted = t.replace(/^Posted on/, '').trim();
          else if (t.indexOf('Job type') === 0) jobType = t.replace(/^Job type/, '').trim();
          else if (t.indexOf('Region') === 0) location = t.replace(/^Region/, '').trim();
        }
        var row = {
          'Date Posted': posted,
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Company': companyEl ? companyEl.innerText.trim() : '',
          'Job Type': jobType,
          'Location': location,
          'Link to Apply': window.location.href
        };
        var columns = ['Date Posted','Job Title','Company','Job Type','Location','Link to Apply'];
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
