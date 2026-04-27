import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('q4r5s6t', 'Extract Medical Citations PubMed', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Programming.Function', 'Set Query', {
      func: `
        msg.query = 'machine learning';
        return msg;
      `
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.search_url = 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(msg.query);
        msg.csv_path = global.get('$Home$') + '/extract-medical-citations-pubmed.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open PubMed Search', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Results', {
      inPageId: Message('page_id'),
      inSelector: Custom('//article[contains(@class,"docsum")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Citations', {
      inPageId: Message('page_id'),
      func: `
        var articles = document.querySelectorAll('article[class*="docsum"]');
        var columns = ['Position','Title','Authors','PMID','Abstract'];
        var rows = [];
        for (var i = 0; i < articles.length; i++) {
          var art = articles[i];
          var titleEl = art.querySelector('[class*="docsum-title"], a[href*="/pubmed/"]');
          var title = titleEl ? titleEl.innerText.trim() : '';
          if (!title) continue;
          var authorsEl = art.querySelector('[class*="authors"], [class*="short-authors"]');
          var authors = authorsEl ? authorsEl.innerText.trim() : '';
          var pmidM = art.id ? art.id.match(/[0-9]+/) : null;
          var pmid = pmidM ? pmidM[0] : '';
          if (!pmid) {
            var pmidEl = art.querySelector('[class*="docsum-pmid"]');
            pmid = pmidEl ? pmidEl.innerText.replace('PMID:','').trim() : '';
          }
          var abstractEl = art.querySelector('[class*="abstract"]');
          var abstract = abstractEl ? abstractEl.innerText.trim().substring(0, 300) : '';
          rows.push({'Position':'#'+(rows.length+1),'Title':title,'Authors':authors,'PMID':pmid,'Abstract':abstract});
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
