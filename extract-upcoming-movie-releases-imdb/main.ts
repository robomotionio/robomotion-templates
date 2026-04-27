import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2d1', 'Extract Upcoming Movie Releases IMDb', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.calendar_url = 'https://www.imdb.com/calendar/';
        msg.csv_path = global.get('$Home$') + '/extract-upcoming-movie-releases-imdb.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Calendar', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('calendar_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Items', {
      inPageId: Message('page_id'),
      inSelector: Custom('//li[@data-testid="coming-soon-entry"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Movies', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('li[data-testid="coming-soon-entry"]');
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var titleA = it.querySelector('a.ipc-metadata-list-summary-item__t');
          var img = it.querySelector('img.ipc-image');
          var genreLis = it.querySelectorAll('ul.ipc-metadata-list-summary-item__tl li');
          var castLis = it.querySelectorAll('ul.ipc-metadata-list-summary-item__stl li');
          var g = ['','',''];
          for (var k = 0; k < Math.min(3, genreLis.length); k++) g[k] = genreLis[k].innerText.trim();
          var c = ['','','',''];
          for (var m = 0; m < Math.min(4, castLis.length); m++) c[m] = castLis[m].innerText.trim();
          rows.push({
            'Position': '#' + (i + 1),
            'Title': titleA ? titleA.innerText.trim() : '',
            'Genre 1': g[0],
            'Genre 2': g[1],
            'Genre 3': g[2],
            'Lead Actor': c[0],
            'Supporting Actor 1': c[1],
            'Supporting Actor 2': c[2],
            'Supporting Actor 3': c[3],
            'Poster Image': img ? img.src : '',
            'Movie Link': titleA ? titleA.href : ''
          });
        }
        var columns = ['Position','Title','Genre 1','Genre 2','Genre 3','Lead Actor','Supporting Actor 1','Supporting Actor 2','Supporting Actor 3','Poster Image','Movie Link'];
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
