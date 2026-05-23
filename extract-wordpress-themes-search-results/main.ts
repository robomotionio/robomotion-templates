import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('j7k8l9m', 'Extract WordPress Themes Search Results', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Themes URL', {
      inText: Custom('Enter WordPress themes URL (e.g. https://wordpress.org/themes/search/blog/)'),
      outText: Message('themes_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-wordpress-themes-search-results.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Themes Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('themes_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Themes', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"wordpress.org/themes/")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Themes', {
      inPageId: Message('page_id'),
      func: `
        var links = document.querySelectorAll('a[href*="wordpress.org/themes/"]');
        var columns = ['Position','Theme Name','Theme Link','Theme Image'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var href = link.href.split('?')[0];
          if (seen[href] || !href.match(/\\/themes\\/[a-z]/)) continue;
          seen[href] = true;
          var name = link.innerText.trim() || link.getAttribute('title') || '';
          if (!name || name.length < 2) {
            var nameEl = link.querySelector('h2, h3, span, p');
            if (nameEl) name = nameEl.innerText.trim();
          }
          if (!name || name.length < 2) continue;
          var img = link.querySelector('img') || (link.parentElement ? link.parentElement.querySelector('img') : null);
          rows.push({'Position':'#'+(rows.length+1),'Theme Name':name,'Theme Link':href,'Theme Image':img?img.src:''});
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
