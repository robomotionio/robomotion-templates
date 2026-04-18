import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('b3bf6a71-ad35-4750-819d-d5f687a182fd', 'Imported Take Screenshot of a Web Page', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Take Screenshot of a Web Page\n\nOpens a URL in a browser and saves a screenshot of the rendered page to disk.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Dialog.InputBox', 'Ask For URL', {
      inTitle: Custom('Take screenshot of a website'),
      inText: Custom('Please provide the website address to take screenshot of..'),
      optDefault: Custom('robomotion.io'),
      outText: Message('url_input'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `var u = (msg.url_input || '').trim(); if (!u) return [null, msg]; if (!/^https?:\\/\\//i.test(u)) u = 'https://' + u; msg.url = u; return [msg, null];`,
    });

  f.node('a10004', 'Core.Programming.Function', 'Build Screenshot Path', {
    func: `msg.desktop_path = global.get('$Home$') + '/Desktop'; msg.screenshot_path = msg.desktop_path + '/ScreenShot.png'; msg.retry_count = 0; return msg;`,
  })
    .then('a10040', 'Core.Flow.GoTo', 'Enter Retry', {
      optNodes: { type: 'goto', ids: ['a10041'], all: false },
    });

  f.node('a10041', 'Core.Flow.Label', 'Retry Point', {})
    .then('a10005', 'Core.Browser.Open', 'Launch Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id'),
    })
    .then('a10006', 'Core.Browser.OpenLink', 'Open URL', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('url'),
      optTimeout: 60,
      outPageId: Message('page_id'),
    })
    .then('a10007', 'Core.Browser.Screenshot', 'Take Screenshot', {
      inPageId: Message('page_id'),
      inSaveFilePath: Message('screenshot_path'),
      outPath: Message('screenshot_saved_path'),
    })
    .then('a10008', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id'),
    })
    .then('a10009', 'Robomotion.DateTime.Now', 'Get Now', {
      optLayout: 'RFC3339',
      optTimezoneOffset: 'Local',
      outNow: Message('now'),
    })
    .then('a10010', 'Robomotion.DateTime.Format', 'Format Stamp', {
      inTime: Message('now'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('2006-01-02@03-04'),
      outFormattedTime: Message('stamp'),
    })
    .then('a10011', 'Core.Programming.Function', 'Build Stamped Path', {
      func: `msg.renamed_path = msg.desktop_path + '/ScreenShot-' + msg.stamp + '.png'; return msg;`,
    })
    .then('a10012', 'Core.FileSystem.Move', 'Rename Screenshot', {
      inSrcPath: Message('screenshot_path'),
      inDestPath: Message('renamed_path'),
      continueOnError: true,
    })
    .then('a10013', 'Core.Programming.Function', 'Build Results Text', {
      func: `msg.dialog_text = 'The screenshot is stored at:\\n\\n' + msg.renamed_path; return msg;`,
    })
    .then('a10014', 'Core.Dialog.MessageBox', 'Show Result', {
      inTitle: Custom('Screenshot taken!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10050', 'Core.Trigger.Catch', 'Catch Launch Errors', {
    optNodes: { type: 'catch', all: false, ids: ['a10005', 'a10006'] },
  })
    .then('a10051', 'Core.Programming.Function', 'Check Retry', {
      outputs: 2,
      func: `if ((msg.retry_count || 0) < 1) { msg.retry_count = (msg.retry_count || 0) + 1; return [msg, null]; } return [null, msg];`,
    });

  f.node('a10052', 'Core.Programming.Sleep', 'Wait 2s', {
    optDuration: Custom(2),
  })
    .then('a10053', 'Core.Flow.GoTo', 'Retry', {
      optNodes: { type: 'goto', ids: ['a10041'], all: false },
    });

  f.node('a10098', 'Core.Flow.Stop', 'Stop Fail', { optSuccess: 'failed', optReason: Custom('Browser launch failed after 1 retry') });
  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10014', 0, 'a10099', 0);
  f.edge('a10051', 0, 'a10052', 0);
  f.edge('a10051', 1, 'a10098', 0);
});

myFlow.start();
