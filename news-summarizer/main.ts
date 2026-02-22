import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('016a8c95-48fc-4b3c-a67a-f5e9947af88c', 'News Summarizer', (f) => {
  f.node('d81975', 'Core.Flow.Comment', 'Comment', {
    optText: '## News Summarizer\n\nShows how to read and summarize news from CNN.\n\n### How it Works?\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Hugging Face package icon, install it.\n\n**3.** Edit the Config Node.\n\n**4.** Set the msg.link to the link of news which you want to read and summarize.'
  });
  f.node('e7b2c7', 'Core.Trigger.Inject', 'Start', {})
    .then('b65c7d', 'Core.Programming.Function', 'Config', {
    func: 'msg.link = "https://edition.cnn.com/2022/08/02/tech/airbnb-q2-earnings-travel/index.html"; // news link\nreturn msg;'
  })
    .then('400fa6', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true,
    optUserDataDir: Custom(''),
    optDownloadDir: Custom(''),
    optProxyCredentials: Custom('{'vaultId': '_', 'itemId': '_'}')
  })
    .then('bf2cbf', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('link'),
    outPageId: Message('page_id')
  })
    .then('6cb248', 'Core.Browser.GetValue', 'Get Value', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="body-text"]'),
    inAttribute: Custom(''),
    outValue: Message('news')
  })
    .then('59a414', 'Core.Browser.CloseWindow', 'Close Window', { inPageId: Message('page_id') })
    .then('71f6aa', 'Robomotion.HuggingFace.TextSummarization', 'Text Summarization', {
    inText: Message('news'),
    outMessage: Message('result'),
    optModelName: Custom('')
  });
  f.node('d01479', 'Core.Flow.Stop', 'Stop', {});
  f.node('c730a4', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });

  f.edge('71f6aa', 0, 'd01479', 0);
  f.edge('71f6aa', 0, 'c730a4', 0);
}).start();
