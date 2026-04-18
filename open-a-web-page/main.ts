import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('01abdb64-744a-447d-a38d-f5389c5c4735', 'Imported Open a Web Page', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Open a Web Page\n\nLaunches a browser and navigates to a provided URL — the minimum viable browser-automation template.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Dialog.InputBox', 'Ask For URL', {
      inTitle: Custom('Website address'),
      inText: Custom('Please provide the website address to launch..'),
      optDefault: Custom('robomotion.io'),
      outText: Message('url_input'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `var u = (msg.url_input || '').trim();
if (!u) return [null, msg];
if (!/^https?:\\/\\//i.test(u)) u = 'https://' + u; msg.url = u; msg.retry_count = 0; return [msg, null];`,
    })
    .then('a10010', 'Core.Flow.GoTo', 'Enter Retry', {
      optNodes: { type: 'goto', ids: ['a10011'], all: false },
    });

  f.node('a10011', 'Core.Flow.Label', 'Retry Point', {})
    .then('a10004', 'Core.Browser.Open', 'Launch Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id'),
    })
    .then('a10005', 'Core.Browser.OpenLink', 'Open URL', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('url'),
      optTimeout: 60,
      outPageId: Message('page_id'),
    });

  f.node('a10020', 'Core.Trigger.Catch', 'Catch Launch Errors', {
    optNodes: { type: 'catch', all: false, ids: ['a10004', 'a10005'] },
  })
    .then('a10021', 'Core.Programming.Function', 'Check Retry', {
      outputs: 2,
      func: `if ((msg.retry_count || 0) < 1) { msg.retry_count = (msg.retry_count || 0) + 1;
return [msg, null]; } return [null, msg];`,
    });

  f.node('a10022', 'Core.Programming.Sleep', 'Wait 2s', {
    optDuration: Custom(2),
  })
    .then('a10023', 'Core.Flow.GoTo', 'Retry', {
      optNodes: { type: 'goto', ids: ['a10011'], all: false },
    });

  f.node('a10098', 'Core.Flow.Stop', 'Stop Fail', { optSuccess: 'failed', optReason: Custom('Browser launch failed after 1 retry') });
  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10010', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10005', 0, 'a10099', 0);
  f.edge('a10021', 0, 'a10022', 0);
  f.edge('a10021', 1, 'a10098', 0);
});

myFlow.start();
