import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('n5o6p7', 'Extract Online Event Details Eventbrite', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Event URL', {
      inText: Custom('Enter Eventbrite event URL (e.g. https://www.eventbrite.com/e/event-name-tickets-12345)'),
      outText: Message('event_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-online-event-details-eventbrite.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Event Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('event_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Event Title', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Event Details', {
      inPageId: Message('page_id'),
      func: `
        var name = '';
        var dateTime = '';
        var location = '';
        var price = '';
        var about = '';
        var schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (schemaScript) {
          try {
            var schema = JSON.parse(schemaScript.textContent);
            name = schema.name || '';
            if (schema.startDate) {
              dateTime = schema.startDate;
              if (schema.endDate) dateTime += ' - ' + schema.endDate;
            }
            if (schema.location) {
              if (schema.location.name) location = schema.location.name;
              else if (schema.location['@type'] === 'VirtualLocation') location = 'Online';
            }
            if (schema.offers) {
              var offer = Array.isArray(schema.offers) ? schema.offers[0] : schema.offers;
              if (offer) {
                if (offer.price === 0 || offer.price === '0') price = 'Free';
                else if (offer.price) price = offer.priceCurrency ? offer.priceCurrency + ' ' + offer.price : String(offer.price);
              }
            }
            about = (schema.description || '').replace(/<[^>]+>/g, ' ').substring(0, 500);
          } catch(e) {}
        }
        if (!name) {
          var h1 = document.querySelector('h1');
          name = h1 ? h1.innerText.trim() : '';
        }
        var bodyTxt = document.body.innerText;
        if (!dateTime) {
          var dtM = bodyTxt.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*(?:,)? [A-Z][a-z]+ [0-9]{1,2}[^\\n]{0,60}(?:AM|PM)/);
          if (!dtM) dtM = bodyTxt.match(/[A-Z][a-z]+ [0-9]{1,2},? [0-9]{4}[^\\n]{0,60}(?:AM|PM)/);
          if (!dtM) dtM = bodyTxt.match(/Multiple dates/);
          if (dtM) dateTime = dtM[0].trim().substring(0, 100);
        }
        if (!location) {
          var onlineM = bodyTxt.match(/Online Event|Virtual Event|Online Location|Zoom|Google Meet|Microsoft Teams/);
          location = onlineM ? 'Online' : '';
          if (!location) {
            var locIdx = bodyTxt.indexOf('Location');
            if (locIdx >= 0) {
              var locLine = bodyTxt.substring(locIdx + 8, locIdx + 60).trim().split('\\n')[0];
              if (locLine && locLine.length < 50 && locLine.indexOf('autocomplete') < 0) location = locLine;
            }
          }
        }
        if (!price) {
          var priceM = bodyTxt.match(/From \\$[0-9,.]+|Free|\\$[0-9,.]+ per person|\\$[0-9,.]+/);
          if (priceM) price = priceM[0];
        }
        if (!about) {
          var idx = bodyTxt.indexOf('About this event');
          if (idx >= 0) {
            about = bodyTxt.substring(idx + 16, idx + 516).trim();
          } else {
            var idx2 = bodyTxt.indexOf('About');
            if (idx2 >= 0) about = bodyTxt.substring(idx2 + 5, idx2 + 505).trim();
          }
        }
        var columns = ['Name','Date and Time','Location','Price','About Event'];
        var rows = [{ 'Name': name, 'Date and Time': dateTime, 'Location': location, 'Price': price, 'About Event': about }];
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
