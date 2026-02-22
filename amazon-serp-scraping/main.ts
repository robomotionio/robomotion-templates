import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('6610fa22-f7ba-4867-af43-f9a5a350d234', 'Amazon Search Result Scraping', (f) => {
  f.node('f39420', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Amazon Search Result Scraping\nScrapes product data from Amazon search results\n\n##### How it Works?\n1. Edit Config (Function) node\n\n2. Change msg.keywords for searching the given keywords\n'
  });
  f.node('27dd31', 'Core.Trigger.Inject', 'Start', {})
    .then('af8b1b', 'Core.Programming.Function', 'Config', {
    func: 'msg.keywords = "best dog food";\n\n\nmsg.amazonSearchUrl = "https://www.amazon.com/s?k=" + msg.keywords;\n\nreturn msg;\n'
  })
    .then('a55a40', 'Core.Flow.SubFlow', 'Initialize DB', { subflow: 'aa32c28f-d464-4757-be50-bb6e755ee33c' })
    .then('67a030', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true,
    optProxyCredentials: Custom('{'vaultId': '_', 'itemId': '_'}'),
    optUserDataDir: Custom('')
  })
    .then('52ece6', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('root_page_id'),
    inUrl: Message('amazonSearchUrl'),
    outPageId: Message('root_page_id')
  })
    .then('cfb4b5', 'Core.Browser.Refresh', 'Refresh', {
    inPageId: Message('root_page_id'),
    delayBefore: 2
  });
  f.node('faaa98', 'Core.Flow.Label', 'Next Page', {});
  f.node('d3d4b6', 'Core.Flow.SubFlow', 'Scrape Page', { subflow: '6092ffad-60a6-4479-9518-cba48e9340c5' })
    .then('07b025', 'Core.Flow.SubFlow', 'Click Next or Stop', {
    outputs: 2,
    subflow: '42029467-2736-4afc-a4a1-b53151e5da49'
  });
  f.node('563376', 'Core.Flow.GoTo', 'Go To Next Page', { optNodes: { ids: ['faaa98'], type: 'goto', all: false } });
  f.node('11b058', 'Core.Flow.Stop', 'Stop', {});

  f.edge('faaa98', 0, 'd3d4b6', 0);
  f.edge('cfb4b5', 0, 'd3d4b6', 0);
  f.edge('07b025', 0, '563376', 0);
  f.edge('07b025', 1, '11b058', 0);
}).start();
