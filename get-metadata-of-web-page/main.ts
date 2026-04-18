import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('61fc2c33-d57d-4a26-8e18-d1d828480019', 'Imported Get Metadata of a Web Page', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get Metadata of a Web Page\n\nNavigates to a URL, reads its title and meta tags, and returns them as structured data. Useful for link previews or SEO audits.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Dialog.InputBox', 'Ask For URL', {
      inTitle: Custom('Get metadata of a web page'),
      inText: Custom('Please provide the web page address that you want to examine:'),
      optDefault: Custom('robomotion.io'),
      outText: Message('url_input'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `var u = (msg.url_input || '').trim(); if (!u) return [null, msg]; if (!/^https?:\\/\\//i.test(u)) u = 'https://' + u; msg.url = u; return [msg, null];`,
    });

  f.node('a10004', 'Core.Browser.Open', 'Launch Browser', {
    optBrowser: 'chrome',
    optMaximized: true,
    outBrowserId: Message('browser_id'),
  })
    .then('a10005', 'Core.Browser.OpenLink', 'Open URL', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('url'),
      optTimeout: 60,
      outPageId: Message('page_id'),
    })
    .then('a10020', 'Core.Flow.SubFlow', 'Show Title', {})
    .then('a10021', 'Core.Flow.SubFlow', 'Show Keywords', {})
    .then('a10022', 'Core.Flow.SubFlow', 'Show Description', {})
    .then('a10023', 'Core.Flow.SubFlow', 'Show HTML Source', {})
    .then('a10006', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id'),
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10006', 0, 'a10099', 0);
});

myFlow.start();
