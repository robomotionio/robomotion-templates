import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('e2f3g4h', 'Extract Services List IFTTT', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.page_url = 'https://ifttt.com/services';
        msg.csv_path = global.get('$Home$') + '/extract-services-list-ifttt.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open IFTTT Services', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('page_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Services', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(@class,"service-card-list-item")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Services', {
      inPageId: Message('page_id'),
      func: `
        var links = document.querySelectorAll('a[href*="ifttt.com/"][class*="service"]');
        if (!links.length) links = document.querySelectorAll('[class*="service-card-list-item"] a, [class*="ServiceCard"] a, a[href*="/service"]');
        var columns = ['Position','Service Name','Service URL','Service Image'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var href = link.href;
          if (!href || seen[href]) continue;
          var fullTxt = (link.innerText||'').trim().replace(/[\\s]+/g,' ');
          if (!fullTxt || fullTxt.length < 2) {
            var p = link.parentElement;
            fullTxt = (p.innerText||'').trim().replace(/[\\s]+/g,' ');
          }
          var name = fullTxt.split(' ').filter(function(w){return w.trim().length > 0;}).join(' ');
          if (!name || name.length < 2 || name.length > 60) continue;
          seen[href] = true;
          var img = link.querySelector('img') || (link.parentElement ? link.parentElement.querySelector('img') : null);
          rows.push({ 'Position': '#'+(rows.length+1), 'Service Name': name, 'Service URL': href, 'Service Image': img ? img.src : '' });
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
