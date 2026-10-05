import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('4ada64', 'LinkedIn Job Scraper', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Job Scraper\n\nReads a LinkedIn job: its title, company, location and the About the job text, into a CSV.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the page URL (for example https://www.linkedin.com/jobs/view/4473604100/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the LinkedIn page URL (e.g. https://www.linkedin.com/jobs/view/4473604100/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-job-scraper.csv';
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
    .then('000006', 'Core.Browser.GetValue', 'Get jobTitle', {
      inSelector: Custom('(//button[@aria-label=\'More options\'])[1]/following::div[normalize-space()][1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('jobTitle'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000007', 'Core.Browser.GetValue', 'Get company', {
      inSelector: Custom('//button[@aria-label=\'For Business\']/following::a[normalize-space()][3]'),
      inAttribute: Custom('innerText'),
      outValue: Message('company'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.GetValue', 'Get jobLocation', {
      inSelector: Custom('(//section[@aria-label=\'Primary content\']//span[normalize-space()])[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('jobLocation'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000009', 'Core.Browser.GetValue', 'Get jobDescription', {
      inSelector: Custom('//h2[normalize-space(.)=\'About the job\']/following::p[normalize-space()][1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('jobDescription'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000a', 'Core.Programming.Function', 'Make Table', {
      func: `
        var columns = ["jobTitle","company","jobLocation","jobDescription"];
        var row = {};
        columns.forEach(function (c) { row[c] = msg[c] == null ? '' : String(msg[c]).trim(); });
        msg.table = { columns: columns, rows: [row] };
        return msg;
      `
    })
    .then('00000b', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('00000c', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('00000d', 'Core.Flow.Stop', 'Stop', {});
}).start();
