import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Browser', (f) => {
  f.node('08befe', 'Core.Flow.Begin', 'Begin', {})
    .then('858730', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  })
    .then('ab86d6', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Custom('https://www.twitter.com'),
    outPageId: Message('page_id')
  });
  f.node('5a52c3', 'Core.Browser.RunScript', 'Set Session Cookie', {
    func: 'document.cookie="auth_token=" + msg.auth_token + ";secure";',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('4e3119', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('ab86d6', 0, '5a52c3', 0);
  f.edge('4e3119', 0, '5a52c3', 0);
});
