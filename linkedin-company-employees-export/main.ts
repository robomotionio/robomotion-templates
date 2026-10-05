import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('40b31b', 'LinkedIn Company Employees Export', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Company Employees Export\n\nExports the people of a LinkedIn company (name, title, photo) into a CSV, pressing Show more results until it has enough.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the list URL (for example https://www.linkedin.com/company/microsoft/people/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the LinkedIn list URL (e.g. https://www.linkedin.com/company/microsoft/people/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-company-employees-export.csv';
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
      inSelector: Custom('//h2[normalize-space(.)=\'People you may know\']/following::ul[1]//li'),
      optCustomListItems: [
        Custom({"name":"Photo","selector":"./div/section/div/div/div[1]/img","attribute":"src"}),
        Custom({"name":"Text 1","selector":"./div/section/div/div/div[2]/div[2]/div/div","attribute":"text"})
      ],
      optPagination: 'loadMore',
      inNextSelector: Custom('//button[normalize-space(.)=\'Show more results\']'),
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
