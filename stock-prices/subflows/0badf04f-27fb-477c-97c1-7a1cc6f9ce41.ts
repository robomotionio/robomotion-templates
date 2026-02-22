import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Create Link', (f) => {
  f.node('53dbac', 'Core.Flow.Begin', 'Begin', {})
    .then('8322e8', 'Core.Programming.Function', 'Create Link', {
    func: 'var q = msg.stock.symbol + "+stock+price";\nmsg.link = "https://www.google.com/search?q=" + q;\nreturn msg;\n'
  })
    .then('a5d84c', 'Core.Browser.OpenLink', 'Go to Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('link'),
    outPageId: Message('page_id'),
    optSameTab: true
  })
    .then('b680cb', 'Core.Browser.GetValue', 'Get Price', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="knowledge-finance-wholepage__entity-summary"]/div/g-card-section/div/g-card-section/div[2]/div[1]/span[1]/span/span[1]'),
    inAttribute: Custom(''),
    outValue: Message('value')
  })
    .then('4ac615', 'Core.Flow.End', 'End', { sfPort: 0 });
});
