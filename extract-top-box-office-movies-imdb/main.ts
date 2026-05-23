import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2cf', 'Extract Top Box Office Movies IMDb', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.boxoffice_url = 'https://www.imdb.com/chart/boxoffice/';
        msg.csv_path = global.get('$Home$') + '/extract-top-box-office-movies-imdb.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Box Office', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('boxoffice_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Items', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"ipc-metadata-list-summary-item__tc")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Movies', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('div.ipc-metadata-list-summary-item__tc');
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var titleA = it.querySelector('a.ipc-title-link-wrapper');
          var titleEl = it.querySelector('h3.ipc-title__text');
          var img = it.querySelector('img.ipc-image');
          var li = it.querySelectorAll('li[data-testid^="title-metadata-box-office-data"], li.gWYDIV');
          var pickByLabel = function(label) {
            var as = it.querySelectorAll('li');
            for (var k = 0; k < as.length; k++) {
              var t = as[k].innerText;
              if (t.indexOf(label) === 0) return t.replace(label, '').replace(':', '').trim();
            }
            return '';
          };
          var weekend = pickByLabel('Weekend Gross');
          var total = pickByLabel('Total Gross');
          var weeks = pickByLabel('Weeks Released');
          var ratingEl = it.querySelector('[data-testid="ratingGroup--imdb-rating"] .ipc-rating-star--rating, .ipc-rating-star--rating');
          var votesEl = it.querySelector('.ipc-rating-star--voteCount');
          rows.push({
            'Position': '#' + (i + 1),
            'Movie Title': titleEl ? titleEl.innerText.trim() : '',
            'Weekend Gross': weekend,
            'Total Gross': total,
            'Weeks Released': weeks,
            'IMDb Rating': ratingEl ? ratingEl.innerText.trim() : '',
            'Rating Votes': votesEl ? votesEl.innerText.replace(/[()]/g,'').trim() : '',
            'Poster Image': img ? img.src : '',
            'Movie Description': '',
            'Movie Link': titleA ? titleA.href : ''
          });
        }
        var columns = ['Position','Movie Title','Weekend Gross','Total Gross','Weeks Released','IMDb Rating','Rating Votes','Poster Image','Movie Description','Movie Link'];
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
