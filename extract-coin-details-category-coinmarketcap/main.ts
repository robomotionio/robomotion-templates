import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('e5f6a7', 'Extract Coin Details Category CoinMarketCap', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Category URL', {
      inText: Custom('Enter a CoinMarketCap category URL (e.g. https://coinmarketcap.com/view/defi/)'),
      outText: Message('category_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-coin-details-category-coinmarketcap.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Category Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('category_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Table', {
      inPageId: Message('page_id'),
      inSelector: Custom('table tbody tr a[href*="/currencies/"]'),
      inSelectorType: 'css',
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Coins', {
      inPageId: Message('page_id'),
      func: `
        var columns = ['Position','Currency Name','Symbol','Price','Market Cap','24h Volume Dollar','Ranking','1 Hour Value','24 Hours Value','7 Days Value'];
        var rows = [];
        var trs = document.querySelectorAll('table tbody tr');
        var pos = 0;
        for (var i = 0; i < trs.length; i++) {
          var cells = trs[i].querySelectorAll('td');
          if (cells.length < 9) continue;
          var rankTxt = (cells[1].innerText || '').trim();
          if (!/^[0-9]+$/.test(rankTxt)) continue;
          var ps = cells[2].querySelectorAll('p');
          var name = ps.length > 0 ? ps[0].innerText.trim() : '';
          var symbol = ps.length > 1 ? ps[1].innerText.trim() : '';
          if (!name) continue;
          pos++;
          var vol = (cells[8].innerText || '').trim().split(/\\s*\\n\\s*/)[0];
          rows.push({
            'Position': '#' + pos,
            'Currency Name': name,
            'Symbol': symbol,
            'Price': (cells[3].innerText || '').trim(),
            'Market Cap': (cells[7].innerText || '').trim(),
            '24h Volume Dollar': vol,
            'Ranking': '#' + rankTxt,
            '1 Hour Value': (cells[4].innerText || '').trim(),
            '24 Hours Value': (cells[5].innerText || '').trim(),
            '7 Days Value': (cells[6].innerText || '').trim()
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
