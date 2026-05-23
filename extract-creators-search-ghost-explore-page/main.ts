import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1b2c6', 'Extract Creators Search Ghost Explore Page', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.query = msg.query || 'marketing';
        msg.search_url = 'https://explore.ghost.org/?q=' + encodeURIComponent(msg.query);
        msg.csv_path = global.get('$Home$') + '/extract-creators-search-ghost-explore-page.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"explore.ghost.org/p/")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Creators', {
      inPageId: Message('page_id'),
      func: `
        var anchors = document.querySelectorAll('a[href*="explore.ghost.org/p/"]');
        var seen = {};
        var rows = [];
        var pos = 0;
        for (var i = 0; i < anchors.length; i++) {
          var a = anchors[i];
          var slug = a.getAttribute('data-site-slug');
          if (!slug || seen[slug]) continue;
          seen[slug] = true;
          pos++;
          var cat = a.querySelector('span');
          rows.push({
            'Position': '#' + pos,
            'Title': a.getAttribute('data-title') || '',
            'Description': a.getAttribute('data-description') || '',
            'Image URL': a.getAttribute('data-publication-icon') || '',
            'Website': a.getAttribute('data-url') || '',
            'Category': cat ? cat.innerText.trim() : '',
            'Number of Members': a.getAttribute('data-member-count') || '',
            'MRR': ''
          });
        }
        var columns = ['Position','Title','Description','Image URL','Website','Category','Number of Members','MRR'];
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
