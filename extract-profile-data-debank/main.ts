import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('d1e2f3', 'Extract Profile Data DeBank', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Wallet URL', {
      inText: Custom('Enter DeBank profile URL (e.g. https://debank.com/profile/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)'),
      outText: Message('profile_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-profile-data-debank.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Profile Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('profile_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Chain Values', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(@class,"AssetsOnChain_item") and contains(.,",")]'),
      optTimeout: Custom('25')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Chain Holdings', {
      inPageId: Message('page_id'),
      func: `
        var columns = ['Asset Name','Blockchain Name','Asset Value','Total Asset Percentage','Position'];
        var rows = [];
        var bodyTxt = document.body.innerText;
        var allChainIdx = bodyTxt.indexOf('All Chain');
        if (allChainIdx < 0) return JSON.stringify({ columns: columns, rows: rows });
        var chainSection = bodyTxt.substring(allChainIdx + 9);
        var unfoldIdx = chainSection.indexOf('Unfold');
        if (unfoldIdx > 0) chainSection = chainSection.substring(0, unfoldIdx);
        var parts = chainSection.split('\\n').filter(function(s) { return s.trim(); });
        var i = 0;
        while (i < parts.length - 2) {
          var name = parts[i].trim();
          var value = parts[i+1] ? parts[i+1].trim() : '';
          var pct = parts[i+2] ? parts[i+2].trim() : '';
          if (value.indexOf('$') >= 0 && value !== '$0' && pct.indexOf('%') >= 0) {
            rows.push({
              'Asset Name': name,
              'Blockchain Name': name,
              'Asset Value': value,
              'Total Asset Percentage': pct,
              'Position': '#' + (rows.length + 1)
            });
            i += 3;
          } else {
            i++;
          }
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
