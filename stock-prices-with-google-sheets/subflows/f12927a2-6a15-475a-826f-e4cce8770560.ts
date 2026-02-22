import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Create Link', (f) => {
  f.node('713d5c', 'Core.Flow.Begin', 'Begin', {})
    .then('db9b3a', 'Core.Programming.Function', 'Create Link', {
    func: 'var q = msg.stock.symbol + "+stock+price";\nmsg.link = "https://www.google.com/search?q=" + q;\nreturn msg;\n'
  })
    .then('ca36cb', 'Core.Browser.OpenLink', 'Go to Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('link'),
    outPageId: Message('page_id'),
    optSameTab: true
  })
    .then('4400c1', 'Core.Browser.GetValue', 'Get Price', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="knowledge-finance-wholepage__entity-summary"]/div/g-card-section/div/g-card-section/div[2]/div[1]/span[1]/span/span[1]'),
    inAttribute: Custom(''),
    outValue: Message('value')
  })
    .then('7715fe', 'Core.Flow.End', 'End', { sfPort: 0 });
});
