import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('l3m4n5', 'Extract List Places Search Result Airbnb', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Airbnb search results URL (e.g. https://www.airbnb.com/s/New-York--NY--United-States/homes)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-list-places-search-result-airbnb.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Search Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Listings', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[@itemprop="itemListElement"]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Listings', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[itemprop="itemListElement"]');
        var columns = ['Position','Title','Name of Place','Price','Rating'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var link = card.querySelector('a[href*="/rooms/"]');
          if (!link) continue;
          var lines = card.innerText.split('\\n').filter(function(l) { return l.trim(); });
          var title = '';
          var place = '';
          var price = '';
          var rating = '';
          for (var j = 0; j < lines.length; j++) {
            var l = lines[j].trim();
            if (!place && /in [A-Z]/.test(l) && l.length < 50) { place = l; continue; }
            if (!title && place && l.length > 5 && l.indexOf(' bed') < 0 && l.indexOf(' bath') < 0 && l.indexOf('May') < 0 && l.indexOf('Jun') < 0 && l.indexOf('Jul') < 0 && !/^[0-9]/.test(l) && l !== ',' && l !== '·' && l.indexOf(' · ') < 0) { title = l; }
            if (/[0-9,]+\s*[₺$£€]|[₺$£€][0-9,]+/.test(l) && !price && l.indexOf('nights') < 0) price = l;
            if (/^[0-9]\.[0-9]+ \\(/.test(l) || /^[0-9]\.[0-9]+$/.test(l)) rating = l;
          }
          if (!title) continue;
          rows.push({
            'Position': '#' + (rows.length + 1),
            'Title': title,
            'Name of Place': place,
            'Price': price,
            'Rating': rating
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
