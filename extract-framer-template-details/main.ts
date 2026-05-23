import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('m0n1o2p', 'Extract Framer Template Details', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Template URL', {
      inText: Custom('Enter Framer template URL (e.g. https://www.framer.com/marketplace/templates/my-template/)'),
      outText: Message('template_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-framer-template-details.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Template Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('template_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Title', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Template Details', {
      inPageId: Message('page_id'),
      func: `
        var h1 = document.querySelector('h1');
        var name = h1 ? h1.innerText.trim() : '';
        var bodyTxt = document.body.innerText;
        var priceM = bodyTxt.match(/Free|\\$[0-9]+/);
        var price = priceM ? priceM[0] : '';
        var creatorM = bodyTxt.match(/by ([^\\n]+)/i);
        var creator = creatorM ? creatorM[1].trim().substring(0,50) : '';
        var descEl = document.querySelector('p, [class*="description"]');
        var desc = '';
        var allPs = document.querySelectorAll('p');
        for (var i=0;i<allPs.length;i++) {
          var t = allPs[i].innerText.trim();
          if (t.length > 20 && t.indexOf('Framer') < 0) { desc = t; break; }
        }
        var columns = ['Template Name','Creator Name','Price','Template URL','Description'];
        var rows = [{'Template Name':name,'Creator Name':creator,'Price':price,'Template URL':location.href,'Description':desc.substring(0,300)}];
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
