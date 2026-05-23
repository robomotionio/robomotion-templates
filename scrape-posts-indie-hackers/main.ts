import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2cc', 'Scrape Posts Indie Hackers', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.feed_url = 'https://www.indiehackers.com/newest';
        msg.csv_path = global.get('$Home$') + '/scrape-posts-indie-hackers.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Feed', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('feed_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Posts', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"feed-item--post")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Posts', {
      inPageId: Message('page_id'),
      func: `
        var items = document.querySelectorAll('.feed-item--post');
        var rows = [];
        for (var i = 0; i < items.length; i++) {
          var s = items[i];
          var titleA = s.querySelector('.feed-item__title-link');
          var author = s.querySelector('.user-link__name');
          var likes = s.querySelector('.like-count__count') || s.querySelector('.feed-item__likes-count');
          var comments = s.querySelector('.reply-count__number-count');
          rows.push({
            'Post Title': titleA ? titleA.innerText.trim() : '',
            'Author': author ? author.innerText.trim() : '',
            'Upvotes': likes ? likes.innerText.trim() : '0',
            'Comments': comments ? comments.innerText.trim() : '0',
            'Topic': ''
          });
        }
        var columns = ['Post Title','Author','Upvotes','Comments','Topic'];
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
