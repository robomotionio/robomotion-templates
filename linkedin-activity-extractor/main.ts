import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('476e04', 'LinkedIn Activity Extractor', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Activity Extractor\n\nExports a LinkedIn member\'s recent activity (each post\'s text, author and links) into a CSV, scrolling for more.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the list URL (for example https://www.linkedin.com/in/williamhgates/recent-activity/all/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the linkedin list URL (e.g. https://www.linkedin.com/in/williamhgates/recent-activity/all/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-activity-extractor.csv';
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
      inSelector: Custom('//h2[normalize-space(.)=\'All activity\']/following::div[@data-component-type=\'LazyColumn\'][1]//div[count(ancestor::div)=12]'),
      optCustomListItems: [
        Custom({"name":"Text 1","selector":".//div[@role='listitem']//span","attribute":"text"}),
        Custom({"name":"Text 2","selector":"./div/div/div/div/div[1]/div/div[1]/div[1]/div/div[2]/p/span","attribute":"text"}),
        Custom({"name":"Text 3","selector":"./div/div/div/div/div[1]/div/div[1]/div[1]/div/div[3]/div/div/a/p","attribute":"text"}),
        Custom({"name":"Text 4","selector":"./div/div/div/div/div[1]/div/div[1]/div[1]/div/div[4]/p/span","attribute":"text"}),
        Custom({"name":"Text 5","selector":".//span[@data-testid='expandable-text-box']","attribute":"text"})
      ],
      optPagination: 'scroll',
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
