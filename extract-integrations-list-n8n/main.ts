import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('f3g4h5i', 'Extract Integrations List N8n', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.page_url = 'https://n8n.io/integrations';
        msg.csv_path = global.get('$Home$') + '/extract-integrations-list-n8n.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open n8n Integrations', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('page_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Integration Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/integrations/") and contains(@class,"card")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Integrations', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('a[href*="/integrations/"][class*="card"]');
        var columns = ['Position','App Name','App Link','App Image'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var href = card.href.split('?')[0];
          if (seen[href] || !href.match(/\\/integrations\\/[a-z]/)) continue;
          seen[href] = true;
          var lines = (card.innerText||'').split('\\n').filter(function(l){return l.trim();});
          var name = lines[0] || '';
          if (!name || name.length < 2) continue;
          var img = card.querySelector('img');
          rows.push({ 'Position': '#'+(rows.length+1), 'App Name': name, 'App Link': href, 'App Image': img ? img.src : '' });
        }
        return JSON.stringify({ columns: columns, rows: rows });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
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
