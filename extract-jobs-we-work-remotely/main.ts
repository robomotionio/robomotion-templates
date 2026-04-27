import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d2', 'Extract Jobs We Work Remotely', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.feed_url = 'https://weworkremotely.com/';
        msg.csv_path = global.get('$Home$') + '/extract-jobs-we-work-remotely.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open WWR', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('feed_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Listings', {
      inPageId: Message('page_id'),
      inSelector: Custom('//li[contains(@class,"new-listing-container")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('li.new-listing-container');
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var titleEl = it.querySelector('.new-listing__header__title__text');
          var companyEl = it.querySelector('.new-listing__company-name');
          var locationEl = it.querySelector('.new-listing__company-headquarters');
          var dateEl = it.querySelector('.new-listing__header__icons__date');
          var cats = it.querySelectorAll('.new-listing__categories__category');
          var jobType = '';
          var locFromCat = '';
          for (var k = 0; k < cats.length; k++) {
            var t = cats[k].innerText.trim();
            if (/Full-Time|Part-Time|Contract/i.test(t)) jobType = t;
            else if (/Anywhere|^[A-Z][a-z]/.test(t) && t !== 'Featured') locFromCat = t;
          }
          var linkA = it.querySelector('a.listing-link--unlocked, a.listing-link');
          rows.push({
            'Position': '#' + (i + 1),
            'Company Name': companyEl ? companyEl.innerText.trim() : '',
            'Job Title': titleEl ? titleEl.innerText.trim() : '',
            'Job Type': jobType,
            'Location': locationEl ? locationEl.innerText.trim() : locFromCat,
            'Date Posted': dateEl ? dateEl.innerText.trim() : '',
            'Job Link': linkA ? linkA.href : ''
          });
        }
        var columns = ['Position','Company Name','Job Title','Job Type','Location','Date Posted','Job Link'];
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
