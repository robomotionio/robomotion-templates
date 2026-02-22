import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Link', (f) => {
  f.node('9de3f2', 'Core.Trigger.Catch', 'Catch', { optNodes: { ids: ['dfb0bb'], type: 'goto', all: false } });
  f.node('76ae99', 'Core.Flow.Begin', 'Begin', {});
  f.node('dfb0bb', 'Core.Browser.WaitElement', 'Wait Follow Button', {
    inPageId: Message('page_id'),
    inSelector: Custom('//span[text()=\'Follow\']'),
    inSelectorType: 'xpath:position',
    optCondition: 'to-appear',
    optTimeout: Custom('30')
  });
  f.node('2401b2', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('account_url'),
    outPageId: Message('page_id'),
    optSameTab: true
  });
  f.node('4a5d3b', 'Core.Browser.RunScript', 'Follow Account', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = "//span[text()=\'Follow\']";\nvar elem = getElementByXpath(path);\nelem.click();',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('83091d', 'Core.Programming.Function', 'Function', {
    func: 'msg.account_url = "https://twitter.com/" + msg.twitter_account;\nreturn msg;'
  });
  f.node('b27575', 'Core.Programming.Sleep', 'Sleep', {
    optDuration: Custom('2'),
    optRandMax: Custom(''),
    optRandMin: Custom(''),
    optRandom: false
  });
  f.node('e40b02', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('dfb0bb', 0, '2401b2', 0);
  f.edge('4a5d3b', 0, 'e40b02', 0);
  f.edge('dfb0bb', 0, 'b27575', 0);
  f.edge('4a5d3b', 0, 'b27575', 0);
  f.edge('9de3f2', 0, 'e40b02', 0);
  f.edge('76ae99', 0, '83091d', 0);
  f.edge('2401b2', 0, '83091d', 0);
});
