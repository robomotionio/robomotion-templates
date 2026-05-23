import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('i6j7k8l', 'Extract Search Results Plugins WordPress Org', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter WordPress plugins search URL (e.g. https://wordpress.org/plugins/search/seo/)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-search-results-plugins-wordpress-org.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Plugins Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Plugins', {
      inPageId: Message('page_id'),
      inSelector: Custom('//article | //div[contains(@class,"plugin")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Plugins', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('[class*="plugin-card"], article[class*="plugin"], .plugin');
        var columns = ['Position','Plugin Name','Rating','Active Installs','Tested Up To','Plugin Link'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var nameEl = card.querySelector('h3, [class*="plugin-name"]');
          var name = nameEl ? nameEl.innerText.trim() : '';
          if (!name) continue;
          var link = card.querySelector('a[href*="wordpress.org/plugins"]');
          var href = link ? link.href.split('?')[0] : '';
          if (!href || seen[href]) continue;
          seen[href] = true;
          var ratingEl = card.querySelector('[class*="rating"], .wporg-ratings');
          var rating = '';
          if (ratingEl) { var rm = ratingEl.innerText.match(/([0-9.]+)/); if (rm) rating = rm[1]; }
          var installEl = card.querySelector('[class*="active-installs"]');
          var installs = installEl ? installEl.innerText.replace('Active Installations','').trim() : '';
          var testedEl = card.querySelector('[class*="tested"]');
          var tested = testedEl ? testedEl.innerText.replace('Tested up to','').trim() : '';
          rows.push({'Position':'#'+(rows.length+1),'Plugin Name':name,'Rating':rating,'Active Installs':installs,'Tested Up To':tested,'Plugin Link':href});
        }
        return JSON.stringify({ columns: columns, rows: rows });
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
