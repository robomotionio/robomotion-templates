import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('da4a41', 'LinkedIn Post Likers Export', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### LinkedIn Post Likers Export\n\nExports the people who reacted to a LinkedIn post (name, profile link, headline) into a CSV, from the post\'s reactions list.\n\nLog in to LinkedIn once in Chrome, then set the profile folder in Setup Vars and enter the page URL (for example https://www.linkedin.com/feed/update/urn:li:activity:7508263424536080384/) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000002', 'Core.Dialog.InputBox', 'Get Page URL', {
      inText: Custom('Enter the LinkedIn page URL (e.g. https://www.linkedin.com/feed/update/urn:li:activity:7508263424536080384/)'),
      outText: Message('url')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/linkedin-post-likers-export.csv';
        return msg;
      `
    })
    .then('000004', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      optUserDataDir: Message('profile_dir'),
      outBrowserId: Message('browser_id')
    })
    .then('000006', 'Core.Browser.OpenLink', 'Open Link', {
      inUrl: Message('url'),
      inBrowserId: Message('browser_id'),
      outPageId: Message('page_id')
    })
    .then('000007', 'Core.Browser.RunScript', 'RunScript', {
      func: `var el = document.evaluate("//main[@id='workspace']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; if (!el) throw new Error("element not found"); el.scrollTo(0, 555);`
    })
    .then('000008', 'Core.Browser.ClickElement', 'ClickElement', {
      inSelector: Custom('//a[contains(normalize-space(.),\' reaction\')]'),
      optClickType: 'singleClick'
    })
    .then('000009', 'Core.Browser.ScrapeList', 'ScrapeList', {
      inSelector: Custom('//div[@data-testid=\'lazy-column\']/div[.//span[normalize-space(.)=\'Follow\']]'),
      optCustomListItems: [
        Custom({"attribute":"text","name":"Name","selector":".//span[normalize-space()]"}),
        Custom({"attribute":"src","name":"Photo","selector":".//img"}),
        Custom({"attribute":"href","name":"Profile URL","selector":".//a[normalize-space()]"}),
        Custom({"attribute":"text","name":"Headline","selector":"./div/a/div/div[2]/p/span"})
      ],
      optMaxRows: Custom('100'),
      outTable: Message('table')
    })
    .then('00000a', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('00000b', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('00000c', 'Core.Flow.Stop', 'Stop', {});
}).start();
