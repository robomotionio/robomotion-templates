import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('y6z7a8', 'Extract Tool Details Future Tools', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Tool URL', {
      inText: Custom('Enter Future Tools tool URL (e.g. https://www.futuretools.io/tools/chatgpt)'),
      outText: Message('tool_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-tool-details-future-tools.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Tool Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('tool_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Content', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Tool Details', {
      inPageId: Message('page_id'),
      func: `
        var bodyTxt = document.body.innerText;
        var h1 = document.querySelector('h1');
        var tool = h1 ? h1.innerText.trim() : '';
        var descEl = document.querySelector('p, [class*="description"]');
        var description = '';
        var allPs = document.querySelectorAll('p');
        for (var i=0;i<allPs.length;i++) {
          var t = allPs[i].innerText.trim();
          if (t.length > 20 && t.length < 500 && t.indexOf('Future Tools') < 0) { description = t; break; }
        }
        var priceM = bodyTxt.match(/\\b(Free|Freemium|Paid|Open Source|Contact for Pricing)\\b/);
        var pricing = priceM ? priceM[1] : '';
        var upvoteM = bodyTxt.match(/([0-9,]+)\\s*(?:upvote|vote)/i);
        var upvotes = upvoteM ? upvoteM[1] : '';
        var websiteLinks = document.querySelectorAll('a[href^="http"]:not([href*="futuretools"])');
        var website = '';
        for (var j=0;j<websiteLinks.length;j++) {
          var lh = websiteLinks[j].href;
          if (lh.indexOf('twitter') < 0 && lh.indexOf('facebook') < 0 && lh.indexOf('youtube') < 0) {
            website = lh;
            break;
          }
        }
        var columns = ['Tool','Description','Pricing','Upvotes','Website'];
        var rows = [{ 'Tool': tool, 'Description': description.substring(0,300), 'Pricing': pricing, 'Upvotes': upvotes, 'Website': website }];
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
