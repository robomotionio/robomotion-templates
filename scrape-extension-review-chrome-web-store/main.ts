import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('t1u2v3', 'Scrape Extension Review Chrome Web Store', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Extension URL', {
      inText: Custom('Enter Chrome Web Store extension URL (e.g. https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm)'),
      outText: Message('ext_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-extension-review-chrome-web-store.csv';
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
    .then('555555', 'Core.Browser.WaitElement', 'Wait Reviews', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(.,"Offered by")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Reviews', {
      inPageId: Message('page_id'),
      func: `
        var reviewEls = document.querySelectorAll('[class*="review"], [aria-label*="review"], [data-review-id]');
        var columns = ['Position','Reviewer','Avatar','Rating','Date','Review'];
        var rows = [];
        if (reviewEls.length > 0) {
          for (var i = 0; i < reviewEls.length && rows.length < 20; i++) {
            var el = reviewEls[i];
            var txt = (el.innerText || '').trim();
            if (txt.length < 10) continue;
            var lines = txt.split('\\n').filter(function(l) { return l.trim(); });
            var reviewer = lines[0] || '';
            var rating = '';
            var date = '';
            var review = '';
            for (var j = 1; j < lines.length; j++) {
              var l = lines[j].trim();
              if (/^[1-5]$/.test(l) && !rating) rating = l;
              else if (/[0-9]{4}/.test(l) && !date) date = l;
              else if (l.length > 15 && !review) review = l;
            }
            var img = el.querySelector('img');
            if (!reviewer || !review) continue;
            rows.push({ 'Position': '#' + (rows.length + 1), 'Reviewer': reviewer, 'Avatar': img ? img.src : '', 'Rating': rating, 'Date': date, 'Review': review.substring(0, 300) });
          }
        }
        if (rows.length === 0) {
          var bodyTxt = document.body.innerText;
          var reviewIdx = bodyTxt.indexOf('Reviews');
          if (reviewIdx >= 0) {
            var section = bodyTxt.substring(reviewIdx + 7, reviewIdx + 3000);
            var parts = section.split('\\n').filter(function(l) { return l.trim(); });
            var i = 0;
            while (i < parts.length && rows.length < 10) {
              var line = parts[i].trim();
              if (line.length > 20 && !/^[0-9]/.test(line) && line.indexOf('Overview') < 0) {
                var ratingLine = parts[i+1] ? parts[i+1].trim() : '';
                var dateLine = parts[i+2] ? parts[i+2].trim() : '';
                var reviewLine = parts[i+3] ? parts[i+3].trim() : '';
                if (ratingLine && reviewLine) {
                  rows.push({ 'Position': '#' + (rows.length + 1), 'Reviewer': line, 'Avatar': '', 'Rating': ratingLine, 'Date': dateLine, 'Review': reviewLine.substring(0, 300) });
                  i += 4;
                  continue;
                }
              }
              i++;
            }
          }
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
