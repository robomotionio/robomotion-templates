import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2cb', 'Extract Group Posts Indie Hackers', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.group_url = msg.group_url || 'https://www.indiehackers.com/group/main';
        msg.csv_path = global.get('$Home$') + '/extract-group-posts-indie-hackers.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Group', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('group_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Posts', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"story") and contains(@class,"homepage-post")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Posts', {
      inPageId: Message('page_id'),
      func: `
        var stories = document.querySelectorAll('.story.homepage-post');
        var rows = [];
        for (var i = 0; i < stories.length; i++) {
          var s = stories[i];
          var title = s.querySelector('.story__title');
          var author = s.querySelector('.user-link__name');
          var titleA = s.querySelector('a.story__text-link');
          var likes = s.querySelector('.story__count--likes .story__count-number');
          var comments = s.querySelector('.story__count--comments .story__count-number');
          rows.push({
            'Position': '#' + (i + 1),
            'Title': title ? title.innerText.trim() : '',
            'Upvotes': likes ? likes.innerText.trim() : '0',
            'Submitted by': author ? author.innerText.trim() : '',
            'Posted Date': '',
            'Comment Count': comments ? comments.innerText.trim() : '0',
            'Post Link': titleA ? titleA.href : ''
          });
        }
        var columns = ['Position','Title','Upvotes','Submitted by','Posted Date','Comment Count','Post Link'];
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
