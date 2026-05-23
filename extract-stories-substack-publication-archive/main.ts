import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2c4', 'Extract Stories Substack Publication Archive', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.publication_url = msg.publication_url || 'https://www.lennysnewsletter.com';
        var base = msg.publication_url.replace(/\\/+$/, '');
        msg.archive_url = base + '/archive?sort=new';
        msg.csv_path = global.get('$Home$') + '/extract-stories-substack-publication-archive.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Archive', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('archive_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Posts', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[@data-testid="post-preview-title"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Posts', {
      inPageId: Message('page_id'),
      func: `
        var titleAnchors = document.querySelectorAll('a[data-testid="post-preview-title"]');
        var rows = [];
        for (var i = 0; i < titleAnchors.length; i++) {
          var titleA = titleAnchors[i];
          var c = titleA;
          while (c && c.parentElement) {
            c = c.parentElement;
            var p = c.parentElement;
            if (!p) break;
            var sibsHave = false;
            var kids = p.children;
            for (var j = 0; j < kids.length; j++) {
              if (kids[j] !== c && kids[j].querySelector && kids[j].querySelector('a[data-testid="post-preview-title"]')) { sibsHave = true; break; }
            }
            if (sibsHave) break;
          }
          var descA = c.querySelectorAll('a');
          var description = '';
          for (var k = 0; k < descA.length; k++) {
            if (descA[k] !== titleA && descA[k].href === titleA.href) { description = descA[k].innerText.trim(); break; }
          }
          var time = c.querySelector('time');
          var date = time ? (time.getAttribute('datetime') || time.innerText.trim()) : '';
          var likeBtn = c.querySelector('button[aria-label^="Like"]');
          var commBtn = c.querySelector('button[aria-label*="comments"]');
          var likes = '0';
          if (likeBtn) {
            var lm = likeBtn.getAttribute('aria-label').match(/\\d+/);
            likes = lm ? lm[0] : '0';
          }
          var comments = '0';
          if (commBtn) {
            var cm = commBtn.getAttribute('aria-label').match(/\\d+/);
            comments = cm ? cm[0] : '0';
          }
          var img = c.querySelector('img');
          rows.push({
            'Position': '#' + (i + 1),
            'Title': titleA.innerText.trim(),
            'Description': description,
            'Date': date,
            'Number Of Likes': likes,
            'Number of comments': comments,
            'Link': titleA.href,
            'Image URL': img ? img.src : ''
          });
        }
        var columns = ['Position','Title','Description','Date','Number Of Likes','Number of comments','Link','Image URL'];
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
