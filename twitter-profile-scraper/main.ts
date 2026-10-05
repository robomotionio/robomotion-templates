import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('199ade', 'Twitter Profile Scraper', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Twitter Profile Scraper\n\nReads an X profile: the name, handle, bio, location, join date, following and followers counts and the number of posts, into a CSV.\n\nLog in to X once in Chrome, then set the profile folder in Setup Vars and enter the page URL (for example https://x.com/BillGates) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the X page URL (e.g. https://x.com/BillGates)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/twitter-profile-scraper.csv';
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
      inSelector: Custom('(//div[@data-testid=\'UserName\']//span[text()[normalize-space()]])[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('fullName'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000007', 'Core.Browser.GetValue', 'Get handle', {
      inSelector: Custom('(//div[@data-testid=\'UserName\']//span[text()[normalize-space()]])[2]'),
      inAttribute: Custom('innerText'),
      outValue: Message('handle'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.GetValue', 'Get bio', {
      inSelector: Custom('//div[@data-testid=\'UserName\']/following::div[normalize-space()][1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('bio'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('000009', 'Core.Browser.GetValue', 'Get location', {
      inSelector: Custom('//span[@data-testid=\'UserLocation\']'),
      inAttribute: Custom('innerText'),
      outValue: Message('location'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000a', 'Core.Browser.GetValue', 'Get joined', {
      inSelector: Custom('//a[@data-testid=\'UserJoinDate\']'),
      inAttribute: Custom('innerText'),
      outValue: Message('joined'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000b', 'Core.Browser.GetValue', 'Get following', {
      inSelector: Custom('//a[@data-testid=\'UserJoinDate\']/following::span[normalize-space()][1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('following'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000c', 'Core.Browser.GetValue', 'Get followers', {
      inSelector: Custom('//a[contains(normalize-space(.),\' Follower\')]/span[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('followers'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000d', 'Core.Browser.GetValue', 'Get postsCount', {
      inSelector: Custom('(//div[@data-testid=\'primaryColumn\']//div[text()[normalize-space()]])[1]'),
      inAttribute: Custom('innerText'),
      outValue: Message('postsCount'),
      optWaitTimeout: Custom('5'),
      continueOnError: true,
      inPageId: Message('page_id')
    })
    .then('00000e', 'Core.Programming.Function', 'Make Table', {
      func: `
        var columns = ["fullName","handle","bio","location","joined","following","followers","postsCount"];
        var row = {};
        columns.forEach(function (c) { row[c] = msg[c] == null ? '' : String(msg[c]).trim(); });
        msg.table = { columns: columns, rows: [row] };
        return msg;
      `
    })
    .then('00000f', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('000010', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('000011', 'Core.Flow.Stop', 'Stop', {});
}).start();
