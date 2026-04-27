import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d3', 'Scrape Job Postings List RemoteOK', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.feed_url = 'https://remoteok.com/';
        msg.csv_path = global.get('$Home$') + '/scrape-job-postings-list-remoteok.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open RemoteOK', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('feed_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Jobs', {
      inPageId: Message('page_id'),
      inSelector: Custom('//tr[contains(@class,"job")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var jobs = document.querySelectorAll('tr.job');
        var rows = [];
        var pos = 0;
        for (var i = 0; i < jobs.length; i++) {
          var j = jobs[i];
          if (!j.getAttribute('data-slug')) continue;
          pos++;
          var titleEl = j.querySelector('h2[itemprop="title"]');
          var companyEl = j.querySelector('h3[itemprop="hiringOrganization"]');
          var locationEl = j.querySelector('.location');
          var salaryEl = j.querySelector('.salary');
          var timeEl = j.querySelector('.time time') || j.querySelector('.time');
          var img = j.querySelector('img.logo');
          var tagEls = j.querySelectorAll('.tags .tag h3');
          var tags = [];
          for (var k = 0; k < tagEls.length; k++) {
            var t = tagEls[k].innerText.replace(/\\s+/g, ' ').trim();
            if (t) tags.push(t);
          }
          var url = j.getAttribute('data-url') || '';
          if (url && url.indexOf('http') !== 0) url = 'https://remoteok.com' + url;
          rows.push({
            'Position': '#' + pos,
            'Job Title': titleEl ? titleEl.innerText.trim() : '',
            'Company Name': companyEl ? companyEl.innerText.trim() : (j.getAttribute('data-company') || ''),
            'Location': locationEl ? locationEl.innerText.trim() : '',
            'Salary': salaryEl ? salaryEl.innerText.trim() : '',
            'Time': timeEl ? timeEl.innerText.trim() : '',
            'Tags': tags.join('; '),
            'Job Link': url,
            'Logo': img ? (img.src || '') : ''
          });
        }
        var columns = ['Position','Job Title','Company Name','Location','Salary','Time','Tags','Job Link','Logo'];
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
