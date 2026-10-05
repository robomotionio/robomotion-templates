import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('391bd7', 'LinkedIn Post Commenter and Liker Scraper', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Post Commenter and Liker Scraper\n\nCollects the people who commented on a LinkedIn post and the people who reacted to it into one CSV: name, profile link, headline, and whether each one commented and/or reacted.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the page URL (for example https://www.linkedin.com/feed/update/urn:li:activity:7508263424536080384/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the LinkedIn page URL (e.g. https://www.linkedin.com/feed/update/urn:li:activity:7508263424536080384/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-post-commenter-and-liker-scraper.csv';
        return msg;
      `
    })
    .then('000004', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      optUserDataDir: Message('profile_dir'),
      outBrowserId: Message('browser_id')
    })
    .then('000006', 'Core.Browser.OpenLink', 'Open Link', {
      inUrl: Message('url'),
      inBrowserId: Message('browser_id'),
      outPageId: Message('page_id')
    })
    .then('000007', 'Core.Browser.RunScript', 'RunScript', {
      func: `var el = document.evaluate("//main[@id='workspace']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; if (!el) throw new Error("element not found"); el.scrollTo(0, 745);`
    })
    .then('000008', 'Core.Browser.RunScript', 'RunScript', {
      func: `var el = document.evaluate("//main[@id='workspace']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; if (!el) throw new Error("element not found"); el.scrollTo(0, 958);`
    })
    .then('000009', 'Core.Browser.ScrapeList', 'ScrapeList', {
      inSelector: Custom('//div[contains(@data-testid,\'commentList\')]/div[.//button[starts-with(@aria-label,\'View more options for\')]]'),
      optCustomListItems: [
        Custom({"attribute":"text","name":"Name","selector":"./div/div/div/div/div[2]/div[1]/div/a/div/div[1]/div/div/p/span/span[2]"}),
        Custom({"attribute":"href","name":"Profile URL","selector":".//a"}),
        Custom({"attribute":"src","name":"Photo","selector":".//img"}),
        Custom({"attribute":"text","name":"Comment","selector":".//span[@data-testid='expandable-text-box']"}),
        Custom({"attribute":"href","name":"Link 2","selector":"./div/div/div/div/div[2]/div[3]/div/a"}),
        Custom({"attribute":"text","name":"Headline","selector":"./div/div/div/div/div[2]/div[1]/div/a/div/div[2]/p/span"}),
        Custom({"attribute":"text","name":"Text 2","selector":".//span[@data-testid='expandable-text-box']//strong"})
      ],
      optPagination: 'scroll',
      optMaxRows: Custom('100'),
      outTable: Message('table_1')
    })
    .then('00000a', 'Core.Browser.RunScript', 'RunScript', {
      func: `var el = document.evaluate("//main[@id='workspace']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; if (!el) throw new Error("element not found"); el.scrollTo(0, 555);`
    })
    .then('00000b', 'Core.Browser.ClickElement', 'ClickElement', {
      inSelector: Custom('//a[contains(normalize-space(.),\' reaction\')]'),
      optClickType: 'singleClick'
    })
    .then('00000c', 'Core.Browser.ScrapeList', 'ScrapeList', {
      inSelector: Custom('//div[@data-testid=\'lazy-column\']/div[.//span[normalize-space(.)=\'Follow\']]'),
      optCustomListItems: [
        Custom({"attribute":"text","name":"Name","selector":".//span[normalize-space()]"}),
        Custom({"attribute":"src","name":"Photo","selector":".//img"}),
        Custom({"attribute":"href","name":"Profile URL","selector":".//a[normalize-space()]"}),
        Custom({"attribute":"text","name":"Headline","selector":"./div/a/div/div[2]/p/span"})
      ],
      optMaxRows: Custom('100'),
      outTable: Message('table_2')
    })
    .then('00000d', 'Core.Programming.Function', 'Combine Lists', {
      func: `
        var key = "Profile URL";
        var flags = ["hasCommented","hasLiked"];
        var rows = {}, order = [], columns = [];
        flags.forEach(function (flag, j) {
          var t = msg['table_' + (j + 1)] || { columns: [], rows: [] };
          t.columns.forEach(function (c) { if (columns.indexOf(c) < 0) columns.push(c); });
          t.rows.forEach(function (row) {
            var k = row[key] || JSON.stringify(row);
            if (!rows[k]) { rows[k] = {}; order.push(k); }
            Object.keys(row).forEach(function (c) { if (row[c] !== '' && row[c] != null) rows[k][c] = row[c]; });
            rows[k][flag] = true;
          });
        });
        columns = columns.concat(flags);
        msg.table = { columns: columns, rows: order.map(function (k) {
          var r = rows[k]; flags.forEach(function (f) { r[f] = !!r[f]; }); return r;
        }) };
        return msg;
      `
    })
    .then('00000e', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('00000f', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('000010', 'Core.Flow.Stop', 'Stop', {});
}).start();
