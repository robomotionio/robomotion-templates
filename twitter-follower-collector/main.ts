import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('e8f9af', 'Twitter Follower Collector', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Twitter Follower Collector\n\nCollects the people who follow an X profile (name, handle, profile link, bio) into a CSV, scrolling for more.\n\nLog in to X once in Chrome, then set the profile folder in Setup Vars and enter the list URL (for example https://x.com/sophiebits/followers) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the X list URL (e.g. https://x.com/sophiebits/followers)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/twitter-follower-collector.csv';
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
      inSelector: Custom('//div[@data-testid=\'cellInnerDiv\']'),
      optCustomListItems: [
        Custom({"name":"Profile URL","selector":".//button[@data-testid='UserCell']//a","attribute":"href"}),
        Custom({"name":"Photo","selector":".//button[@data-testid='UserCell']//img","attribute":"src"}),
        Custom({"name":"Name","selector":".//a[normalize-space()]","attribute":"text"}),
        Custom({"name":"Link 2","selector":"./div/div/button/div/div[2]/div[2]/div[1]/span/a","attribute":"href"}),
        Custom({"name":"Text 1","selector":"./div/div/button/div/div[2]/div[1]/div[1]/div/div[1]/a/div/div[1]/span/span[1]","attribute":"text"}),
        Custom({"name":"Text 2","selector":"./div/div/button/div/div[2]/div[1]/div[1]/div/div[2]/div/a/div/div/span","attribute":"text"}),
        Custom({"name":"Text 3","selector":"./div/div/button/div/div[2]/div[1]/div[3]","attribute":"text"}),
        Custom({"name":"Text 4","selector":"./div/div/button/div/div[2]/div[2]/span[1]","attribute":"text"}),
        Custom({"name":"Text 5","selector":"./div/div/button/div/div[2]/div[2]/div[1]/span/a","attribute":"text"}),
        Custom({"name":"Text 6","selector":"./div/div/button/div/div[2]/div[2]/span[2]","attribute":"text"})
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
