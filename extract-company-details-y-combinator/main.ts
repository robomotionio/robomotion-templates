import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('e3f4a5', 'Extract Company Details Y Combinator', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.yc_url = 'https://www.ycombinator.com/companies';
        msg.csv_path = global.get('$Home$') + '/extract-company-details-y-combinator.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open YC Directory', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('yc_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/companies/")]//*[contains(@class,"_coName")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Companies', {
      inPageId: Message('page_id'),
      func: `
        var columns = ['Company Name','YC Batch','Location','Tag 1','Team Size'];
        var rows = [];
        var cards = document.querySelectorAll('a[href*="/companies/"]');
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var nameEl = c.querySelector('[class*="_coName"]');
          if (!nameEl) continue;
          var name = nameEl.innerText.trim();
          var locEl = c.querySelector('[class*="_coLocation"]');
          var loc = locEl ? locEl.innerText.trim() : '';
          var pills = c.querySelectorAll('[class*="_tagLink"]');
          var batch = pills.length > 0 ? pills[0].innerText.trim() : '';
          var tag1 = pills.length > 1 ? pills[1].innerText.trim() : '';
          var sizeEl = c.querySelector('[class*="_coSize"], [class*="coEmployees"], [class*="size"]');
          var teamSize = '';
          if (sizeEl) {
            teamSize = sizeEl.innerText.trim();
          } else {
            var allSpans = c.querySelectorAll('span');
            for (var j = 0; j < allSpans.length; j++) {
              var t = allSpans[j].innerText.trim();
              if (/^[0-9]/.test(t) && (t.indexOf('-') >= 0 || t.indexOf('+') >= 0)) {
                teamSize = t;
                break;
              }
            }
          }
          rows.push({
            'Company Name': name,
            'YC Batch': batch,
            'Location': loc,
            'Tag 1': tag1,
            'Team Size': teamSize
          });
        }
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
