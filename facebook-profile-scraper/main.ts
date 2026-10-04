import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('14326c', 'Facebook Profile Scraper', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Facebook Profile Scraper\n\nReads a Facebook profile: the name, where the person lives and is from, their work and education, into a CSV.\n\nLog in to Facebook once in Chrome, then set the profile folder in Setup Vars and enter the page URL (for example https://www.facebook.com/OrderBiryani/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the facebook page URL (e.g. https://www.facebook.com/OrderBiryani/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/facebook-profile-scraper.csv';
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
      inSelector: Custom('//a[@aria-label=\'View profile cover photo\']/following::div[@role=\'button\'][1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('fullName'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000007', 'Core.Browser.GetValue', 'Get livesIn', {
      inSelector: Custom('//div[@role=\'listitem\' and starts-with(normalize-space(.),\'Lives\')]'),
      inAttribute: Custom('innerText'),
      outValue: Message('livesIn'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.GetValue', 'Get from', {
      inSelector: Custom('//div[@role=\'listitem\' and starts-with(normalize-space(.),\'From\')]'),
      inAttribute: Custom('innerText'),
      outValue: Message('from'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000009', 'Core.Browser.GetValue', 'Get work', {
      inSelector: Custom('(//div[@role=\'listitem\' and preceding::h2[1][normalize-space(.)=\'Work\']]//div)[2]'),
      inAttribute: Custom('innerText'),
      outValue: Message('work'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000a', 'Core.Browser.GetValue', 'Get education', {
      inSelector: Custom('//h2[normalize-space(.)=\'Education\']/following::div[@role=\'listitem\'][1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('education'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000b', 'Core.Programming.Function', 'Make Table', {
      func: `
        var columns = ["fullName","livesIn","from","work","education"];
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
