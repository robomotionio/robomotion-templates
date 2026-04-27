import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2ce', 'Extract Top Ranking Websites Similarweb', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.top_url = msg.top_url || 'https://www.similarweb.com/top-websites/';
        msg.csv_path = global.get('$Home$') + '/extract-top-ranking-websites-similarweb.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Top Sites', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('top_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Table', {
      inPageId: Message('page_id'),
      inSelector: Custom('//table[contains(@class,"top-table__content")]//tbody/tr'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Rows', {
      inPageId: Message('page_id'),
      func: `
        var trs = document.querySelectorAll('table.top-table__content tbody tr');
        var rows = [];
        for (var i = 0; i < trs.length; i++) {
          var tr = trs[i];
          var rank = tr.querySelector('.tw-table__rank');
          var domain = tr.querySelector('.tw-table__domain');
          var category = tr.querySelector('.tw-table__category');
          var change = tr.querySelector('.tw-table__rank-change');
          var dur = tr.querySelector('.tw-table__avg-visit-duration');
          var pages = tr.querySelector('.tw-table__pages-per-visit');
          var bounce = tr.querySelector('.tw-table__bounce-rate');
          rows.push({
            'Position': rank ? rank.innerText.trim() : '#' + (i + 1),
            'Website': domain ? domain.innerText.trim() : '',
            'Category': category ? category.innerText.trim() : '',
            'Rank Change': change ? change.innerText.trim() : '',
            'Avg Visit Duration': dur ? dur.innerText.trim() : '',
            'Pages Visit': pages ? pages.innerText.trim() : '',
            'Bounce Rate': bounce ? bounce.innerText.trim() : ''
          });
        }
        var columns = ['Position','Website','Category','Rank Change','Avg Visit Duration','Pages Visit','Bounce Rate'];
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
