import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('f16af3', 'LinkedIn Company Scraper', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Company Scraper\n\nReads a LinkedIn company page: the name, industry, size, headquarters, website, specialties and overview, into a CSV.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the page URL (for example https://www.linkedin.com/company/microsoft/about/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the linkedin page URL (e.g. https://www.linkedin.com/company/microsoft/about/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-company-scraper.csv';
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
    .then('000006', 'Core.Browser.GetValue', 'Get name', {
      inSelector: Custom('//h1'),
      inAttribute: Custom('innerText'),
      outValue: Message('name'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000007', 'Core.Browser.GetValue', 'Get industry', {
      inSelector: Custom('//h3[normalize-space(.)=\'Industry\']/following::dd[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('industry'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.GetValue', 'Get companySize', {
      inSelector: Custom('//h3[normalize-space(.)=\'Company size\']/following::dd[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('companySize'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000009', 'Core.Browser.GetValue', 'Get headquarters', {
      inSelector: Custom('//h3[normalize-space(.)=\'Headquarters\']/following::dd[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('headquarters'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000a', 'Core.Browser.GetValue', 'Get website', {
      inSelector: Custom('//h3[normalize-space(.)=\'Website\']/following::a[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('website'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000b', 'Core.Browser.GetValue', 'Get specialties', {
      inSelector: Custom('//h3[normalize-space(.)=\'Specialties\']/following::dd[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('specialties'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000c', 'Core.Browser.GetValue', 'Get overview', {
      inSelector: Custom('//h2[normalize-space(.)=\'Overview\']/following::p[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('overview'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000d', 'Core.Programming.Function', 'Make Table', {
      func: `
        var columns = ["name","industry","companySize","headquarters","website","specialties","overview"];
        var row = {};
        columns.forEach(function (c) { row[c] = msg[c] == null ? '' : String(msg[c]).trim(); });
        msg.table = { columns: columns, rows: [row] };
        return msg;
      `
    })
    .then('00000e', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('00000f', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('000010', 'Core.Flow.Stop', 'Stop', {});
}).start();
