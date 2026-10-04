import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('0327ca', 'LinkedIn Profile Scraper', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Profile Scraper\n\nReads a LinkedIn profile: the name, headline, location, current company and About, into a CSV.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the page URL (for example https://www.linkedin.com/in/williamhgates/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the linkedin page URL (e.g. https://www.linkedin.com/in/williamhgates/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-profile-scraper.csv';
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
    .then('000006', 'Core.Browser.GetValue', 'Get fullName', {
      inSelector: Custom('(//section[@aria-label=\'Primary content\']//h2)[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('fullName'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000007', 'Core.Browser.GetValue', 'Get headline', {
      inSelector: Custom('(//section[@aria-label=\'Primary content\']//p)[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('headline'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.GetValue', 'Get location', {
      inSelector: Custom('//div[@aria-label=\'Profile photo\']/following::p[3]'),
      inAttribute: Custom('innerText'),
      outValue: Message('location'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000009', 'Core.Browser.GetValue', 'Get company', {
      inSelector: Custom('//a[normalize-space(.)=\'Contact info\']/following::div[@role=\'button\'][1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('company'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000a', 'Core.Browser.GetValue', 'Get about', {
      inSelector: Custom('//h2[normalize-space(.)=\'About\']/following::div[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('about'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000b', 'Core.Programming.Function', 'Make Table', {
      func: `
        var columns = ["fullName","headline","location","company","about"];
        var row = {};
        columns.forEach(function (c) { row[c] = msg[c] == null ? '' : String(msg[c]).trim(); });
        msg.table = { columns: columns, rows: [row] };
        return msg;
      `
    })
    .then('00000c', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('00000d', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('00000e', 'Core.Flow.Stop', 'Stop', {});
}).start();
