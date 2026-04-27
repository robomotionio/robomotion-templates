import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('k8l9m0n', 'Extract Templates Framer Category', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Category URL', {
      inText: Custom('Enter Framer marketplace templates URL (e.g. https://www.framer.com/marketplace/?type=templates)'),
      outText: Message('cat_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-templates-framer-category.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Framer Marketplace', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('cat_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Templates', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/marketplace/")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Templates', {
      inPageId: Message('page_id'),
      func: `
        var bodyTxt = document.body.innerText;
        var links = document.querySelectorAll('a[href*="/marketplace/"]');
        var columns = ['Position','Template Name','Creator Name','Price','Template URL'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var href = link.href.split('?')[0];
          if (seen[href] || href === 'https://www.framer.com/marketplace/' || href.indexOf('?type=') >= 0) continue;
          var lines = (link.innerText||'').split('\\n').filter(function(l){return l.trim();});
          if (lines.length < 2) continue;
          var name = '';
          var creator = '';
          var price = '';
          for (var j=0;j<lines.length;j++) {
            var l = lines[j].trim();
            if (!name && l.length > 3 && l !== 'Template' && l !== 'Plugin') name = l;
            else if (name && !creator && l.length > 1 && !/^\\$/.test(l) && l !== 'Template' && l !== 'Plugin') creator = l;
            else if (/^\\$|^Free/.test(l) && !price) price = l;
          }
          if (!name) continue;
          seen[href] = true;
          rows.push({'Position':'#'+(rows.length+1),'Template Name':name,'Creator Name':creator,'Price':price,'Template URL':href});
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
