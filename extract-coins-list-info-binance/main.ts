import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a9b0c1', 'Extract Coins List Info Binance', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.markets_url = 'https://www.binance.com/en/markets/spot_margin-USDT';
        msg.csv_path = global.get('$Home$') + '/extract-coins-list-info-binance.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Markets Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('markets_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Table', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"overview-table-row")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Coins', {
      inPageId: Message('page_id'),
      func: `
        var hdrDiv = null;
        var allDivs = document.querySelectorAll('div');
        for (var i = 0; i < allDivs.length; i++) {
          if (allDivs[i].className && allDivs[i].className.indexOf('overview-table-row') >= 0) {
            hdrDiv = allDivs[i];
            break;
          }
        }
        if (!hdrDiv) return JSON.stringify({ columns: [], rows: [] });
        var parent = hdrDiv.parentElement;
        var dataDiv = parent.children[1];
        if (!dataDiv) return JSON.stringify({ columns: [], rows: [] });
        var columns = ['Position','Name','Symbol','Price','24h Change','24h Volume','Market Cap','Detail Link','Trade Link'];
        var rows = [];
        for (var i = 0; i < dataDiv.children.length; i++) {
          var row = dataDiv.children[i];
          var a = row.querySelector('a[href*="trade/"]');
          var tradeLink = a ? a.href.split('?')[0] : '';
          var sym = '';
          var m = tradeLink.match(/trade\\/([A-Z0-9]+)_/);
          if (m) sym = m[1];
          var parts = (row.innerText || '').split('\\n').filter(function(s) { return s.trim(); });
          if (parts.length < 6) continue;
          var price = parts.length > 4 ? parts[4] : parts[3];
          if (!price) continue;
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Name': sym,
            'Symbol': sym,
            'Price': price,
            '24h Change': parts[5] || '',
            '24h Volume': parts[8] || '',
            'Market Cap': parts[9] || '',
            'Detail Link': tradeLink,
            'Trade Link': tradeLink
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
