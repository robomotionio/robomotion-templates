import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('f5a6b7', 'Extract Freelance Projects From Freelancer Com', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Freelancer.com jobs URL (e.g. https://www.freelancer.com/jobs/)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-freelance-projects-from-freelancer-com.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Jobs Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Job Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"JobSearchCard-item")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Projects', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('.JobSearchCard-item');
        var columns = ['Project Title','Budget','Bids','Skills','Client Rating'];
        var rows = [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var titleEl = card.querySelector('.JobSearchCard-primary-heading-link, a[class*="heading-link"]');
          var title = titleEl ? titleEl.innerText.trim() : '';
          if (!title) continue;
          var secEl = card.querySelector('.JobSearchCard-secondary');
          var secTxt = secEl ? secEl.innerText.trim() : '';
          var budget = '';
          var bids = '';
          var budgetM = secTxt.match(/\\$[\\d,]+ Avg Bid/);
          if (budgetM) budget = budgetM[0].replace(' Avg Bid','');
          else {
            var budgetM2 = secTxt.match(/\\$[\\d,]+\\s*[–-]\\s*\\$[\\d,]+/);
            if (budgetM2) budget = budgetM2[0];
          }
          var bidsM = secTxt.match(/([0-9]+)\\s*bids?/i);
          if (bidsM) bids = bidsM[1];
          var skillEls = card.querySelectorAll('.JobSearchCard-primary-tagsLink, a[class*="tagsLink"]');
          var skills = [];
          for (var j = 0; j < skillEls.length && j < 5; j++) {
            var st = skillEls[j].innerText.trim();
            if (st) skills.push(st);
          }
          var ratingEl = card.querySelector('[class*="ReviewsWidget"], [class*="UserRating"], [class*="rating"]');
          var rating = ratingEl ? ratingEl.innerText.trim() : '';
          rows.push({
            'Project Title': title,
            'Budget': budget,
            'Bids': bids,
            'Skills': skills.join(', '),
            'Client Rating': rating
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
