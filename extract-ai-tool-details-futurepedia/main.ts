import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a8b9c0', 'Extract AI Tool Details Futurepedia', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Tool URL', {
      inText: Custom('Enter Futurepedia tool URL (e.g. https://www.futurepedia.io/tool/chatgpt)'),
      outText: Message('tool_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-ai-tool-details-futurepedia.csv';
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
    .then('555555', 'Core.Browser.WaitElement', 'Wait Title', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Details', {
      inPageId: Message('page_id'),
      func: `
        var h1 = document.querySelector('h1');
        var name = h1 ? h1.innerText.trim() : '';
        var bodyTxt = document.body.innerText;
        var descEl = document.querySelector('p');
        var desc = '';
        var allPs = document.querySelectorAll('p');
        for (var i=0;i<allPs.length;i++) {
          var t = allPs[i].innerText.trim();
          if (t.length > 20 && t.indexOf('Futurepedia') < 0 && t.indexOf('cookie') < 0) { desc = t; break; }
        }
        var priceM = bodyTxt.match(/\\b(Free|Freemium|Paid|Open Source|Contact for Pricing)\\b/i);
        var pricing = priceM ? priceM[1] : '';
        var ratingM = bodyTxt.match(/([0-9](?:\\.[0-9]+)?)\\s*(?:\\/5|stars?|out of)/i);
        var rating = ratingM ? ratingM[1] : '';
        var tags = [];
        var tagEls = document.querySelectorAll('[class*="tag"], [href*="#"]');
        for (var j=0;j<tagEls.length;j++) {
          var t2 = tagEls[j].innerText.trim();
          if (t2.startsWith('#')) tags.push(t2);
        }
        var websiteLinks = document.querySelectorAll('a[href^="http"]:not([href*="futurepedia"])');
        var website = '';
        for (var k=0;k<websiteLinks.length;k++) {
          var lh = websiteLinks[k].href;
          if (lh.indexOf('twitter') < 0 && lh.indexOf('facebook') < 0) { website = lh; break; }
        }
        var columns = ['Tool Name','Description','Pricing','Rating','Category Tags','Website'];
        var rows = [{ 'Tool Name': name, 'Description': desc.substring(0,300), 'Pricing': pricing, 'Rating': rating, 'Category Tags': tags.slice(0,5).join(', '), 'Website': website }];
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
