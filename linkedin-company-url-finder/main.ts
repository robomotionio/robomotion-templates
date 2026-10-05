import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('be29f1', 'LinkedIn Company URL Finder', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Company URL Finder\n\nFinds the LinkedIn company pages for a company name with LinkedIn\'s own company search: each result\'s page URL, name, industry and location, into a CSV.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter what to search for (for example Robomotion) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000006', 'Core.Dialog.InputBox', 'Get Search Text', {
      inText: Custom('Enter what to search LinkedIn for (e.g. Robomotion)'),
      outText: Message('query')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-company-url-finder.csv';
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
      inUrl: Custom('https://www.linkedin.com/feed/'),
      inBrowserId: Message('browser_id'),
      outPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.ClickElement', 'ClickElement', {
      inSelector: Custom('//input[@data-testid=\'typeahead-input\']'),
      optClickType: 'singleClick'
    })
    .then('000009', 'Core.Browser.TypeText', 'TypeText', {
      inSelector: Custom('//input[@data-testid=\'typeahead-input\']'),
      inText: Message('query')
    })
    .then('00000a', 'Core.Browser.SendKeys', 'SendKeys', {
      inSelector: Custom('//input[@data-testid=\'typeahead-input\']'),
      optKeyType1: 'enter'
    })
    .then('00000b', 'Core.Browser.ClickElement', 'ClickElement', {
      inSelector: Custom('//label[normalize-space(.)=\'Companies\']'),
      optClickType: 'singleClick'
    })
    .then('00000c', 'Core.Browser.ScrapeList', 'ScrapeList', {
      inSelector: Custom('//div[@role=\'listitem\']'),
      optCustomListItems: [
        Custom({"attribute":"href","name":"Link","selector":".//a[normalize-space()]"}),
        Custom({"attribute":"href","name":"Link 2","selector":"."}),
        Custom({"attribute":"src","name":"Image","selector":".//img"}),
        Custom({"attribute":"text","name":"Link Text","selector":".//a[normalize-space()]"}),
        Custom({"attribute":"text","name":"Text 1","selector":".//span[normalize-space()]"}),
        Custom({"attribute":"text","name":"Text 2","selector":"./div[1]/div[1]/div[2]/p/span"}),
        Custom({"attribute":"text","name":"Text 3","selector":".//strong[normalize-space()]"}),
        Custom({"attribute":"text","name":"Text 4","selector":"./div[2]/div/div/div[2]/div/p/span"})
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
