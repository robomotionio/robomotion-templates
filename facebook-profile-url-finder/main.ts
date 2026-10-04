import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('7418f2', 'Facebook Profile URL Finder', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Facebook Profile URL Finder\n\nFinds the Facebook profiles for a name with Facebook\'s own people search: each result\'s profile URL and name, into a CSV.\n\nLog in to Facebook once in Chrome, then set the profile folder in Setup Vars and enter what to search for (for example Sharad Cholera) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000006', 'Core.Dialog.InputBox', 'Get Search Text', {
      inText: Custom('Enter what to search Facebook for (e.g. Sharad Cholera)'),
      outText: Message('query')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/facebook-profile-url-finder.csv';
        return msg;
      `
    })
    .then('000004', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      optUserDataDir: Message('profile_dir'),
      outBrowserId: Message('browser_id')
    })
    .then('000007', 'Core.Browser.OpenLink', 'Open Link', {
      inUrl: Custom('https://www.facebook.com/'),
      inBrowserId: Message('browser_id'),
      outPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.ClickElement', 'ClickElement', {
      inSelector: Custom('//input[@aria-label=\'Search Facebook\']'),
      optClickType: 'singleClick'
    })
    .then('000009', 'Core.Browser.TypeText', 'TypeText', {
      inSelector: Custom('//input[@aria-label=\'Search Facebook\']'),
      inText: Message('query')
    })
    .then('00000a', 'Core.Browser.SendKeys', 'SendKeys', {
      inSelector: Custom('//input[@aria-label=\'Search Facebook\']'),
      optKeyType1: 'enter'
    })
    .then('00000b', 'Core.Browser.ClickElement', 'ClickElement', {
      inSelector: Custom('(//span[normalize-space(.)=\'People\'])[1]'),
      optClickType: 'singleClick'
    })
    .then('00000c', 'Core.Browser.ScrapeList', 'ScrapeList', {
      inSelector: Custom('//div[@role=\'article\']'),
      optCustomListItems: [
        Custom({"attribute":"href","name":"Link","selector":".//a[@role='presentation']"}),
        Custom({"attribute":"href","name":"Profile URL","selector":".//a[@role='link']"}),
        Custom({"attribute":"text","name":"Name","selector":".//a[@role='presentation']"}),
        Custom({"attribute":"xlink:href","name":"Image","selector":".//*[local-name()='svg'][@data-visualcompletion='ignore-dynamic']//*[local-name()='image']"})
      ],
      optPagination: 'scroll',
      optMaxRows: Custom('100'),
      outTable: Message('table')
    })
    .then('00000d', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('00000e', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('00000f', 'Core.Flow.Stop', 'Stop', {});
}).start();
