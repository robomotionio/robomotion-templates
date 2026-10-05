import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a752e8', 'Amazon Product Search Scraper', function (f) {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Amazon Product Search Scraper\n\nSearches Amazon from its search box and exports the products it finds (title, product link, price, rating, image) into a CSV, going through the result pages with Next.\n\nLog in to Amazon once in Chrome, then set the profile folder in Setup Vars and enter what to search for (for example wireless mouse) when prompted.' });

  f.node('000001', 'Core.Trigger.Inject', 'Start', {})
    .then('000006', 'Core.Dialog.InputBox', 'Get Search Text', {
      inText: Custom('Enter what to search Amazon for (e.g. wireless mouse)'),
      outText: Message('query')
    })
    .then('000003', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        // A Chrome profile folder you are logged in with. Chrome cannot open a
        // profile another Chrome window has open: close Chrome first, or log in
        // once in a profile of its own and put its folder here.
        msg.profile_dir = global.get('$Home$') + '/AppData/Local/Google/Chrome/User Data';
        msg.csv_path = global.get('$Home$') + '/amazon-product-search-scraper.csv';
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
      inUrl: Custom('https://www.amazon.com/'),
      inBrowserId: Message('browser_id'),
      outPageId: Message('page_id')
    })
    .then('000008', 'Core.Browser.ClickElement', 'ClickElement', {
      inSelector: Custom('//input[@id=\'twotabsearchtextbox\']'),
      optClickType: 'singleClick'
    })
    .then('000009', 'Core.Browser.TypeText', 'TypeText', {
      inSelector: Custom('//input[@id=\'twotabsearchtextbox\']'),
      inText: Message('query')
    })
    .then('00000a', 'Core.Browser.SendKeys', 'SendKeys', {
      inSelector: Custom('//input[@id=\'twotabsearchtextbox\']'),
      optKeyType1: 'enter'
    })
    .then('00000b', 'Core.Browser.RunScript', 'RunScript', {
      func: `window.scrollTo(0, 74);`
    })
    .then('00000c', 'Core.Browser.ScrapeList', 'ScrapeList', {
      inSelector: Custom('//div[@role=\'listitem\']'),
      optCustomListItems: [
        Custom({"attribute":"text","name":"Title","selector":".//div[@data-cy='title-recipe']//span"}),
        Custom({"attribute":"href","name":"Product URL","selector":".//div[@data-cy='image-container']//a"}),
        Custom({"attribute":"src","name":"Image","selector":".//div[@data-cy='image-container']//img"}),
        Custom({"attribute":"text","name":"Title","selector":".//div[@data-cy='title-recipe']//a"}),
        Custom({"attribute":"text","name":"Text 1","selector":".//span[contains(concat(' ',normalize-space(@class),' '),' a-color-secondary ')]"}),
        Custom({"attribute":"text","name":"Text 2","selector":".//span[contains(concat(' ',normalize-space(@class),' '),' a-size-small ')]"}),
        Custom({"attribute":"text","name":"Text 3","selector":".//div[@data-csa-c-type='alf-af-component']//span"}),
        Custom({"attribute":"text","name":"Text 4","selector":".//div[@data-cy='reviews-block']//span"}),
        Custom({"attribute":"text","name":"Text 5","selector":"./div/div/span/div/div/div/div[2]/div/div/div[2]/div[2]/span"})
      ],
      optPagination: 'nextButton',
      inNextSelector: Custom('//a[@aria-label=\'Go to next page, page 2\']'),
      optMaxRows: Custom('100'),
      optPageWait: Custom('2'),
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
