import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c00a', 'Extract Top Companies Built In', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.list_url = msg.list_url || 'https://builtin.com/companies';
        msg.csv_path = global.get('$Home$') + '/extract-top-companies-built-in.csv';
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
      inSelector: Custom('//div[contains(@class,"company-card-horizontal")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Companies', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('div.company-card-horizontal');
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var nameEl = c.querySelector('h2');
          var pageEl = c.querySelector('a[href^="/company/"]');
          var industriesEl = c.querySelector('.company-info-section .text-gray-04, .company-header-grid .text-gray-04');
          var stats = c.querySelector('.company-stats-grid');
          var officesSpan = stats ? stats.querySelector('[data-bs-title]') : null;
          var location = '';
          if (officesSpan) {
            var title = officesSpan.getAttribute('data-bs-title') || '';
            var first = title.split(/<br\\s*\\/?>/i)[0];
            location = first ? first.trim() : (officesSpan.innerText || '').trim();
          } else if (stats) {
            var firstStat = stats.querySelector('span');
            location = firstStat ? firstStat.innerText.trim() : '';
          }
          var employees = '';
          if (stats) {
            var spans = stats.querySelectorAll('span');
            for (var k = 0; k < spans.length; k++) {
              var t = (spans[k].innerText || '').trim();
              if (/Employees$/i.test(t)) { employees = t; break; }
            }
          }
          rows.push({
            'Position': '#' + (i + 1),
            'Company': nameEl ? nameEl.innerText.trim() : '',
            'Company Page': pageEl ? pageEl.href : '',
            'Industries': industriesEl ? industriesEl.innerText.trim() : '',
            'Location': location,
            'Employees': employees
          });
        }
        var columns = ['Position','Company','Company Page','Industries','Location','Employees'];
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
