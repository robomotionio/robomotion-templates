import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Browser', (f) => {
  f.node('dd65b3', 'Core.Flow.Begin', 'Begin', {})
    .then('b70cc0', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  })
    .then('dd3552', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Custom('https://www.twitter.com'),
    outPageId: Message('page_id')
  });
  f.node('815af0', 'Core.Browser.RunScript', 'Set Session Cookie', {
    func: 'document.cookie="auth_token=" + msg.auth_token + ";secure";',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('5c6486', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('dd3552', 0, '815af0', 0);
  f.edge('5c6486', 0, '815af0', 0);
});
