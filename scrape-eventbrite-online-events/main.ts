import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('m4n5o6', 'Scrape Eventbrite Online Events', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Events URL', {
      inText: Custom('Enter Eventbrite events URL (e.g. https://www.eventbrite.com/d/online/events--online/)'),
      outText: Message('events_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-eventbrite-online-events.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Events Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('events_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Event Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(@class,"event-card")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Events', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[class*="event-card"]');
        var columns = ['Position','Title','Image','Event link'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var link = card.querySelector('a[href*="eventbrite.com/e/"]');
          if (!link) continue;
          var href = link.href.replace(/\\?.*/, '');
          if (seen[href]) continue;
          var titleEl = link.querySelector('h2, h3, [class*="title"]');
          if (!titleEl) {
            titleEl = card.querySelector('h2, h3, [class*="title"]');
          }
          var title = titleEl ? titleEl.innerText.trim() : '';
          if (!title) {
            var linkTxt = link.innerText.trim();
            if (linkTxt.length > 5 && linkTxt.length < 200) title = linkTxt;
          }
          if (!title || title.length < 5) continue;
          seen[href] = true;
          var img = card.querySelector('img[src*="evbuc"], img[src*="cdn.evbuc"]');
          var imgSrc = img ? img.src : '';
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Title': title,
            'Image': imgSrc,
            'Event link': link.href
          });
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
