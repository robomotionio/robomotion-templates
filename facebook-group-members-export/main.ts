import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('d2ed4d', 'Facebook Group Members Export', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Facebook Group Members Export\n\nExports the members of a Facebook group you belong to (name, profile link, photo, when they joined, their headline) into a CSV, scrolling until it has them all.\n\nLog in to Facebook once in Chrome, then set the profile folder in Setup Vars and enter the list URL when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the facebook list URL (e.g. https://www.facebook.com/groups/2180474725586463/members)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/facebook-group-members-export.csv';
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
      inSelector: Custom('//div[@role=\'list\' and preceding::h2[1][normalize-space(.)=\'New to the group\']]//div[@role=\'listitem\']'),
      optCustomListItems: [
        Custom({"name":"Profile URL","selector":".//a[@role='link']","attribute":"href"}),
        Custom({"name":"Name","selector":".//a[normalize-space()]","attribute":"text"}),
        Custom({"name":"Photo","selector":".//*[local-name()='svg'][@data-visualcompletion='ignore-dynamic']//*[local-name()='image']","attribute":"xlink:href"}),
        Custom({"name":"Joined","selector":"./div/div/div[2]/div[1]/div/div/div[2]/span/span/div","attribute":"text"}),
        Custom({"name":"Headline","selector":"./div/div/div[2]/div[1]/div/div/div[3]/span","attribute":"text"})
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
