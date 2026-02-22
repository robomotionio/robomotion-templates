import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('604b8632-f138-4138-92ea-5bcec2fb2814', 'Dollar - Euro Parity As Service', (f) => {
  f.node('3997a0', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Dollar - Euro Parity As Service\n\nThis template is triggered with REST request. It returns dolar/euro value as response\n\nFollow these steps to test this template;\n\n**1.** If you do not have curl, you should download from [here](https://curl.se/download.html)\n\n**2.** Open Command Prompt (CMD) and run the following command:\n       curl http://localhost:9090/dollar_euro_parity\n\n '
  });
  f.node('305f8f', 'Core.Net.HttpIn', 'Http In', {
    outBody: Message('body'),
    outHeaders: Message('headers'),
    outCookies: Message('cookies'),
    optMethod: 'GET',
    optEndpoint: '/dollar_euro_parity'
  })
    .then('2b4776', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  })
    .then('1122da', 'Core.Browser.OpenLink', 'Go To wise.com', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Custom('https://wise.com/gb/currency-converter/usd-to-eur-rate'),
    outPageId: Message('page_id')
  })
    .then('c65961', 'Core.Browser.RunScript', 'Get Price', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = "//span[@class=\'text-success\']";\nvar elem = getElementByXpath(path);\nreturn elem.textContent;',
    inPageId: Message('page_id'),
    outResult: Message('result')
  })
    .then('a6d5c3', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('59f25c', 'Core.Net.HttpOut', 'Http Out', {
    inBody: Message('result'),
    inHeaders: Message('headers'),
    inCustomHeaders: [{"name": "Content-Type", "value": "application/json"}],
    inCookies: Message('cookies'),
    inCustomCookies: [],
    inStatus: Custom('200')
  });
}).start();
