import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('s0t1u2', 'Scrape Extension Info Chrome Web Store', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Extension URL', {
      inText: Custom('Enter Chrome Web Store extension URL (e.g. https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm)'),
      outText: Message('ext_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-extension-info-chrome-web-store.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Extension Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('ext_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Content', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(.,"Offered by")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Extension Info', {
      inPageId: Message('page_id'),
      func: `
        var bodyTxt = document.body.innerText;
        var lines = bodyTxt.split('\\n').filter(function(l) { return l.trim(); });
        var name = '';
        var rating = '';
        var category = '';
        var users = '';
        var source = '';
        var ratingM = bodyTxt.match(/([0-9]+\\.[0-9]+)\\s*\\(\\s*[^)]+ratings/);
        if (ratingM) rating = ratingM[1];
        var usersM = bodyTxt.match(/([0-9,]+(?:\\+)?)\\s*users?/);
        if (usersM) users = usersM[1] + (usersM[0].indexOf('+') >= 0 ? '+' : '') + ' users';
        var offeredIdx = bodyTxt.indexOf('Offered by');
        if (offeredIdx >= 0) {
          var offLine = bodyTxt.substring(offeredIdx + 10, offeredIdx + 100).trim().split('\\n')[0];
          source = offLine.trim();
        }
        var catM = bodyTxt.match(/Extension\\s*\\n\\s*([A-Za-z &]+)\\s*\\n/);
        if (catM) category = catM[1].trim();
        if (ratingM) {
          var ratingPos = bodyTxt.indexOf(ratingM[0]);
          var preRating = bodyTxt.substring(Math.max(0, ratingPos - 300), ratingPos);
          var preLines = preRating.split('\\n').filter(function(l) { return l.trim(); });
          name = preLines.length > 0 ? preLines[preLines.length - 1].trim() : '';
        }
        if (!name) {
          for (var i = 0; i < lines.length; i++) {
            var l = lines[i].trim();
            if (l.length > 3 && l.length < 100 && l.indexOf('chrome web store') < 0 && l.indexOf('Sign in') < 0 && l.indexOf('Skip') < 0 && l.indexOf('Discover') < 0 && l.indexOf('Extensions') !== 0) {
              name = l;
              break;
            }
          }
        }
        var columns = ['Name','Source','Rating','Category','Number of Users'];
        var rows = [{ 'Name': name, 'Source': source, 'Rating': rating, 'Category': category, 'Number of Users': users }];
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
