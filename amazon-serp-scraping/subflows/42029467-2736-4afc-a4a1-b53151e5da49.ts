import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Click Next', (f) => {
  f.node('61352f', 'Core.Trigger.Catch', 'Catch', { optNodes: { ids: ['5a089a'], type: 'goto', all: false } });
  f.node('fc9833', 'Core.Flow.Begin', 'Begin', {})
    .then('5a089a', 'Core.Browser.WaitElement', 'Wait Clickable Next', {
    inPageId: Message('root_page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//a[contains(text(),\'Next\') ]'),
    optCondition: 'to-appear',
    optTimeout: Custom('5')
  })
    .then('045df6', 'Core.Browser.ClickElement', 'Click Next', {
    inPageId: Message('root_page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//a[contains(text(),\'Next\') ]'),
    delayAfter: 2
  })
    .then('97d4bf', 'Core.Flow.End', 'Clicked Next', { sfPort: 0 });
  f.node('bb2547', 'Core.Flow.End', 'No More Pages', { sfPort: 1 });

  f.edge('bb2547', 0, '61352f', 0);
});
