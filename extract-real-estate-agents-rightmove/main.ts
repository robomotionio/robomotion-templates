import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('j1k2l3', 'Extract Real Estate Agents Rightmove', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Agents URL', {
      inText: Custom('Enter Rightmove estate agents URL (e.g. https://www.rightmove.co.uk/estate-agents/london.html)'),
      outText: Message('agents_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-real-estate-agents-rightmove.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Agents Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('agents_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Agent Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(@class,"agentCard_agentCard")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Agents', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[class*="agentCard_agentCard"]');
        var columns = ['Position','Agent Name','Telephone Number','Service Type','Agent Description','Agent Logo'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var nameEl = card.querySelector('a[class*="ksc_link"]');
          var name = nameEl ? nameEl.innerText.trim() : '';
          if (!name) continue;
          var phoneEl = card.querySelector('[class*="number__"]');
          var phone = phoneEl ? phoneEl.innerText.trim() : '';
          var typeEl = card.querySelector('[class*="agentType"]');
          var serviceType = typeEl ? typeEl.innerText.trim() : '';
          var descEl = card.querySelector('p');
          var desc = descEl ? descEl.innerText.trim() : '';
          var imgEl = card.querySelector('img');
          var logo = imgEl ? imgEl.src : '';
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Agent Name': name,
            'Telephone Number': phone,
            'Service Type': serviceType,
            'Agent Description': desc,
            'Agent Logo': logo
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
