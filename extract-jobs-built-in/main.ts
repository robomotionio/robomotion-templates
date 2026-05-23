import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c009', 'Extract Jobs Built In', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.list_url = msg.list_url || 'https://builtin.com/jobs';
        msg.csv_path = global.get('$Home$') + '/extract-jobs-built-in.csv';
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
      inSelector: Custom('//div[contains(@class,"job-bounded-responsive")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Jobs', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('div.job-bounded-responsive');
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var titleEl = c.querySelector('a.card-alias-after-overlay');
          var companyEl = c.querySelector('a[href^="/company/"] span');
          var attrSection = c.querySelector('.bounded-attribute-section');
          var location = '', salary = '';
          if (attrSection) {
            var lines = attrSection.innerText.split(/\\n+/);
            for (var k = 0; k < lines.length; k++) {
              var t = lines[k].trim();
              if (!t) continue;
              if (/Annually|Hourly|\\$|\\bK-/i.test(t) && !salary) salary = t;
              else if (/Location|^[A-Z][a-z]+,?\\s|^Remote|United States|USA|, [A-Z]{2}/i.test(t) && !location && !/Annually|Hourly|Ago|Minute|Hour|Day|Week|Reposted|Easy Apply|Senior|Junior|Mid|Entry|Expert|Leader|Hybrid|Remote or|In-Office|Full-time|Part-time|Contract/i.test(t)) {
                location = t;
              }
            }
            if (!location) {
              for (var m = 0; m < lines.length; m++) {
                var t2 = lines[m].trim();
                if (/Locations?$/i.test(t2)) { location = t2; break; }
              }
            }
          }
          rows.push({
            'Position': '#' + (i + 1),
            'Job Title': titleEl ? titleEl.innerText.trim() : '',
            'Company': companyEl ? companyEl.innerText.trim() : '',
            'Location': location,
            'Salary': salary
          });
        }
        var columns = ['Position','Job Title','Company','Location','Salary'];
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
