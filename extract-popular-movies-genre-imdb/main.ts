import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d0', 'Extract Popular Movies Genre IMDb', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.genre = msg.genre || 'action';
        msg.search_url = 'https://www.imdb.com/search/title/?genres=' + encodeURIComponent(msg.genre) + '&title_type=feature&sort=popularity,asc';
        msg.csv_path = global.get('$Home$') + '/extract-popular-movies-genre-imdb.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Genre Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Items', {
      inPageId: Message('page_id'),
      inSelector: Custom('//li[contains(@class,"ipc-metadata-list-summary-item")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Movies', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('li.ipc-metadata-list-summary-item');
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var titleEl = it.querySelector('h3.ipc-title__text');
          var rawTitle = titleEl ? titleEl.innerText.trim() : '';
          var title = rawTitle.replace(/^\\d+\\.\\s*/, '');
          var titleA = it.querySelector('a.ipc-title-link-wrapper');
          var img = it.querySelector('img.ipc-image');
          var metaItems = it.querySelectorAll('.dli-title-metadata-item');
          var year = metaItems[0] ? metaItems[0].innerText.trim() : '';
          var duration = metaItems[1] ? metaItems[1].innerText.trim() : '';
          var rating = metaItems[2] ? metaItems[2].innerText.trim() : '';
          var imdbRating = it.querySelector('.ipc-rating-star--rating');
          var votes = it.querySelector('.ipc-rating-star--voteCount');
          var meta = it.querySelector('.metacritic-score-box');
          var desc = it.querySelector('.ipc-html-content-inner-div, [class*="dli-plot"]');
          rows.push({
            'Position': '#' + (i + 1),
            'Title': title,
            'Year': year,
            'Duration': duration,
            'Rating': rating,
            'Votes': votes ? votes.innerText.replace(/[()]/g,'').trim() : '',
            'Metascore': meta ? meta.innerText.trim() : '',
            'Description': desc ? desc.innerText.trim() : '',
            'Poster': img ? img.src : '',
            'IMDb Link': titleA ? titleA.href : ''
          });
        }
        var columns = ['Position','Title','Year','Duration','Rating','Votes','Metascore','Description','Poster','IMDb Link'];
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
