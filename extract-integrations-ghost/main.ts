import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2ca', 'Extract Integrations Ghost', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.integrations_url = 'https://ghost.org/integrations/';
        msg.csv_path = global.get('$Home$') + '/extract-integrations-ghost.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Integrations', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('integrations_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/integrations/") and not(contains(@href,"/integrations/category"))]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Integrations', {
      inPageId: Message('page_id'),
      func: `
        var anchors = document.querySelectorAll('a[href*="/integrations/"]');
        var rows = [];
        var seen = {};
        var pos = 0;
        for (var i = 0; i < anchors.length; i++) {
          var a = anchors[i];
          var href = a.href;
          if (href.indexOf('/integrations/') === -1) continue;
          if (href.replace(/\\/$/, '').replace(/\\/$/, '').endsWith('/integrations')) continue;
          if (href.indexOf('/integrations/category/') !== -1) continue;
          if (seen[href]) continue;
          var nameEl = a.querySelector('div.mt-4') || a.querySelector('div:not([class*="flex"])');
          var name = nameEl ? nameEl.innerText.trim() : a.innerText.trim();
          if (!name) continue;
          seen[href] = true;
          pos++;
          rows.push({
            'Position': '#' + pos,
            'Integration Name': name,
            'Integration Link': href
          });
        }
        var columns = ['Position','Integration Name','Integration Link'];
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
