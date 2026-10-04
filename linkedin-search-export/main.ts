import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('9274b5', 'LinkedIn Search Export', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Search Export\n\nExports LinkedIn people search results (name, headline, location, photo) into a CSV, page after page with the Next button.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the list URL (for example https://www.linkedin.com/search/results/people/?keywords=rpa%20developer) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the linkedin list URL (e.g. https://www.linkedin.com/search/results/people/?keywords=rpa%20developer)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-search-export.csv';
        return msg;
      `
    })
    .then('000004', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      optUserDataDir: Message('profile_dir'),
      outBrowserId: Message('browser_id')
    })
    .then('000005', 'Core.Browser.OpenLink', 'Open Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('url'),
      outPageId: Message('page_id')
    })
    .then('000006', 'Core.Browser.ScrapeList', 'Scrape List', {
      inSelector: Custom('//div[@role=\'listitem\']'),
      optCustomListItems: [
        Custom({"name":"Profile URL","selector":".//a[normalize-space()]","attribute":"href"}),
        Custom({"name":"Photo","selector":".//img","attribute":"src"}),
        Custom({"name":"Name","selector":".//p[normalize-space()]","attribute":"text"}),
        Custom({"name":"Location","selector":"./div/a/div/div[1]/div[1]/div[2]/p/span","attribute":"text"}),
        Custom({"name":"Text 3","selector":".//strong[normalize-space()]","attribute":"text"})
      ],
      optPagination: 'nextButton',
      inNextSelector: Custom('//button[normalize-space(.)=\'Next\']'),
      optMaxRows: Custom('500'),
      optPageWait: Custom('2'),
      inPageId: Message('page_id'),
      outTable: Message('table')
    })
    .then('000007', 'Core.Programming.Function', 'Full Links', {
      func: `
        var origin = String(msg.url).split("/").slice(0, 3).join("/");
        msg.table.rows.forEach(function (row) {
          Object.keys(row).forEach(function (k) {
            if (typeof row[k] === "string" && row[k].indexOf("/") === 0) row[k] = origin + row[k];
          });
        });
        return msg;
      `
    })
    .then('000008', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('000009', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('00000a', 'Core.Flow.Stop', 'Stop', {});
}).start();
