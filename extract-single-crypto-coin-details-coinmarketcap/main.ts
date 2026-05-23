import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('b8c9d0', 'Extract Single Crypto Coin Details CoinMarketCap', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Coin URL', {
      inText: Custom('Enter a CoinMarketCap coin page URL (e.g. https://coinmarketcap.com/currencies/bitcoin/)'),
      outText: Message('coin_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-single-crypto-coin-details-coinmarketcap.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Coin Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('coin_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Price', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[@data-test="text-cdp-price-display"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Coin Details', {
      inPageId: Message('page_id'),
      func: `
        var h1 = document.querySelector('h1');
        var h1parts = h1 ? h1.innerText.split('\\n') : [];
        var currency = h1parts[0] || '';
        var symbol = h1parts[1] || '';
        var priceEl = document.querySelector('[data-test="text-cdp-price-display"]');
        var price = priceEl ? priceEl.innerText.trim() : '';
        var statsEl = document.querySelector('[data-test="section-coin-stats"]');
        var statsTxt = statsEl ? statsEl.innerText : '';
        var pctMatch = statsTxt.match(/([0-9.]+)%\\s*\\(24h\\)/);
        var change24Rate = pctMatch ? pctMatch[1] + '%' : '';
        var change24Status = statsTxt.indexOf('\\u2191') >= 0 ? 'up' : (statsTxt.indexOf('\\u2193') >= 0 ? 'down' : 'neutral');
        var dts = document.querySelectorAll('[data-test="section-coin-metrics"] dt');
        var dds = document.querySelectorAll('[data-test="section-coin-metrics"] dd');
        var metrics = {};
        for (var i = 0; i < dts.length; i++) {
          var k = dts[i].innerText.trim();
          var v = dds[i] ? dds[i].innerText.trim() : '';
          metrics[k] = v;
        }
        var mktcap = (metrics['Market cap'] || '').split('\\n')[0];
        var mktcapGrowth = (metrics['Market cap'] || '').split('\\n');
        var mktcapRate = mktcapGrowth.length > 1 ? mktcapGrowth[mktcapGrowth.length-1] : '';
        var mktcapStatus = mktcapRate.indexOf('-') >= 0 ? 'down' : (mktcapRate ? 'up' : '');
        var vol24 = (metrics['Volume (24h)'] || '').split('\\n')[0];
        var volMktCap = (metrics['Vol/Mkt Cap (24h)'] || '').trim();
        var circSupply = (metrics['Circulating supply'] || '').split('\\n')[0];
        var circPct = '';
        var circ = metrics['Circulating supply'] || '';
        var pctM = circ.match(/([0-9.]+%)/);
        if (pctM) circPct = pctM[1];
        var totalSupply = (metrics['Total supply'] || '').split('\\n')[0];
        var metricsTxt = document.querySelector('[data-test="section-coin-metrics"]');
        var fullTxt = metricsTxt ? metricsTxt.innerText : '';
        var maxMatch = fullTxt.match(/Max\\.\\s*supply\\s*([^\\n]+)/);
        var maxSupply = maxMatch ? maxMatch[1].trim() : '';
        var fdv = (metrics['FDV'] || '').trim();
        var siteLinks = document.querySelectorAll('[data-test="chip-website-link"]');
        var website = '';
        var whitepaper = '';
        for (var j = 0; j < siteLinks.length; j++) {
          var lt = siteLinks[j].innerText.trim();
          var lh = siteLinks[j].href || '';
          if (lt === 'Whitepaper' && lh) whitepaper = lh;
          else if (lt === 'Website' && lh) website = lh;
        }
        var gitLinks = document.querySelectorAll('a[href*="github.com"]');
        var github = gitLinks.length > 0 ? gitLinks[0].href : '';
        var columns = ['Currency','Symbol','Price','24h Change Status','24h Change Rate','Market Cap','Market Cap Growth Status','Market Cap Growth Rate','Volume 24h','Volume Over Market Cap 24h','Circulating Supply','Circulating Supply Percentage','Total Supply','Max Supply','Fully Diluted Market Cap','Currency Website','Currency GitHub','Currency Whitepaper'];
        var rows = [{
          'Currency': currency,
          'Symbol': symbol,
          'Price': price,
          '24h Change Status': change24Status,
          '24h Change Rate': change24Rate,
          'Market Cap': mktcap,
          'Market Cap Growth Status': mktcapStatus,
          'Market Cap Growth Rate': mktcapRate,
          'Volume 24h': vol24,
          'Volume Over Market Cap 24h': volMktCap,
          'Circulating Supply': circSupply,
          'Circulating Supply Percentage': circPct,
          'Total Supply': totalSupply,
          'Max Supply': maxSupply,
          'Fully Diluted Market Cap': fdv,
          'Currency Website': website,
          'Currency GitHub': github,
          'Currency Whitepaper': whitepaper
        }];
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
