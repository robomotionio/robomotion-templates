import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('rd0001', 'Scrape Reddit Post Homepage Subreddit', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Reddit URL', {
      inText: Custom('Enter Reddit homepage or subreddit URL (e.g. https://www.reddit.com/r/programming/)'),
      outText: Message('input_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        var u = (msg.input_url || 'https://www.reddit.com/').toString().trim();
        u = u.replace(/^https?:\\/\\/(?:www\\.|np\\.|new\\.)?reddit\\.com/i, 'https://old.reddit.com');
        if (u.indexOf('old.reddit.com') === -1) {
          u = 'https://old.reddit.com/';
        }
        msg.scrape_url = u;
        msg.csv_path = global.get('$Home$') + '/scrape-reddit-post-homepage-subreddit.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Reddit', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('scrape_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Posts', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[@id="siteTable"]/div[contains(@class,"thing")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Posts', {
      inPageId: Message('page_id'),
      func: `
        var things = document.querySelectorAll('#siteTable > div.thing');
        var rows = [];
        for (var i = 0; i < things.length; i++) {
          var t = things[i];
          if (t.classList && t.classList.contains('promoted')) continue;
          var rankEl = t.querySelector('.rank');
          var titleEl = t.querySelector('a.title');
          var commentsEl = t.querySelector('a.comments');
          var authorEl = t.querySelector('a.author');
          var scoreEl = t.querySelector('.score.unvoted');
          var timeEl = t.querySelector('time');
          var imgEl = t.querySelector('a.thumbnail img');
          var dataUrl = t.getAttribute('data-url') || '';
          var imageUrl = '';
          if (imgEl && imgEl.src) {
            imageUrl = imgEl.src;
          }
          if (!imageUrl && /\\.(jpg|jpeg|png|gif|webp)(\\?|$)/i.test(dataUrl)) {
            imageUrl = dataUrl;
          }
          var rank = rankEl ? rankEl.textContent.replace(/[^0-9]/g, '') : String(i + 1);
          rows.push({
            'Position': '#' + rank,
            'Link': commentsEl ? commentsEl.href : '',
            'Title': titleEl ? titleEl.textContent.trim() : '',
            'Posted by': authorEl ? authorEl.textContent.trim() : '',
            'Total Comments': commentsEl ? commentsEl.textContent.replace(/[^0-9]/g, '') : '0',
            'Total Votes': scoreEl ? scoreEl.textContent.trim() : '',
            'Time Posted': timeEl ? timeEl.textContent.trim() : '',
            'Image URL': imageUrl
          });
        }
        var columns = ['Position','Link','Title','Posted by','Total Comments','Total Votes','Time Posted','Image URL'];
        return JSON.stringify({columns: columns, rows: rows});
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
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
