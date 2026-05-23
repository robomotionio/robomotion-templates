import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('o6p7q8', 'Scrape Meetup Events Near Location', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Meetup find URL (e.g. https://www.meetup.com/find/?location=New+York&keywords=technology)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-meetup-events-near-location.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Meetup Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Event Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/events/")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Events', {
      inPageId: Message('page_id'),
      func: `
        var links = document.querySelectorAll('a[href*="/events/"]');
        var columns = ['Position','Name','Date','Group','Attendees','Spots Left','Image','Link'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var href = link.href.split('?')[0];
          if (seen[href]) continue;
          var card = link.parentElement;
          if (!card) continue;
          var lines = (card.innerText || '').split('\\n').filter(function(l) { return l.trim(); });
          if (lines.length < 2) continue;
          var name = lines[0] || '';
          if (name.length < 5) continue;
          seen[href] = true;
          var date = '';
          var group = '';
          var attendees = '';
          var spotsLeft = '';
          for (var j = 1; j < lines.length; j++) {
            var l = lines[j].trim();
            if (!date && /[0-9]/.test(l) && (l.indexOf('AM') >= 0 || l.indexOf('PM') >= 0 || /[A-Z][a-z]+,/.test(l))) date = l;
            else if (!group && l.indexOf('by ') === 0) group = l.substring(3);
            else if (!attendees && /[0-9]+ attendee/.test(l)) attendees = l.replace(' attendees','').replace(' attendee','');
            else if (!spotsLeft && /[0-9]+ spot/.test(l)) spotsLeft = l.replace(' spots left','').replace(' spot left','');
          }
          var img = card.querySelector('img[src*="meetupstatic"], img[src*="secure.meetupstatic"]');
          var imgSrc = img ? img.src : '';
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Name': name,
            'Date': date,
            'Group': group,
            'Attendees': attendees,
            'Spots Left': spotsLeft,
            'Image': imgSrc,
            'Link': link.href
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
