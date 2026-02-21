import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('43e8bd7a-c8ba-4da4-ad4b-a7657fb4a671', 'Imported Content Checker', (f) => {
  f.node('438e6b', 'Core.Flow.Comment', 'Comment', { optText: '# Content Watch How-To\n\nThis template uses the *Browser > Get Value* node to monitor and detect if the content of a webpage has changed.\n\n## Usage Steps\n\n### 1. Edit the Config Node\n\nClick on the Config Node to open the settings panel.\n\n### 2. Configure Monitoring Parameters\n\nSet the following fields:\n- `msg.url` - The URL of the webpage you want to monitor\n- `msg.selector` - The CSS selector or XPath of the element you want to watch\n- `msg.initialValue` - The initial/expected value of the content\n\n### 3. Find the Right Selector\n\nUse this [link](https://stackoverflow.com/a/42194160) to learn how to find the selector of webpage content. This [XPath cheatsheet](https://devhints.io/xpath) can also help you create accurate selectors.\n\n## Result\n\nWhen the flow is executed, the template will check if the content at the specified selector has changed from the initial value, allowing you to monitor webpage updates automatically.' });
  f.node('844d53', 'Core.Trigger.Inject', 'Start', {})
    .then('466057', 'Core.Programming.Function', 'Config', { func: '// The URL to watch content change\nmsg.url = "https://blkandbold.com/products/limu-ethiopia-single-origin";\n\n// The element\'s xpath selector to get the price value\n//msg.selector = \'//*[@id="ProductSection-product-template"]/div/div[2]/div[1]/div/dl/div[1]/dd/span\';\n\nmsg.selector = \'//*[@id="shopify-section-template--16874950721734__main"]/section/div/div/div[2]/div/block-price/div/span[1]/div[1]/span[2]/span[2]\'\n\n// Initial value of the element\nmsg.initialValue = \'$11.75\';\n\nreturn msg;\n' })
    .then('c924a8', 'Core.Browser.Open', 'Open Browser', {})
    .then('5af164', 'Core.Browser.OpenLink', 'Open Link', { inUrl: Message('url') })
    .then('d8daa7', 'Core.Browser.GetValue', 'Get Value', { inSelector: Message('selector') })
    .then('32da32', 'Core.Browser.Close', 'Close Browser', {})
    .then('6e19d7', 'Core.Programming.Switch', 'Switch', { optConditions: [{ scope: 'Custom', name: 'msg.initialValue !== msg.value' }, { scope: 'Custom', name: 'msg.initialValue === msg.value' }] })
    .then('8cfd5d', 'Core.Dialog.MessageBox', 'Value Changed', { inTitle: Custom('Test Change'), inText: Custom('Value Changed!!!') });
  f.node('3074b2', 'Core.Dialog.MessageBox', 'Value NOT Changed', { inTitle: Custom('Test Change'), inText: Custom('Value NOT Changed.') });
  f.node('9ba70e', 'Core.Flow.Stop', 'Stop', {});

  f.edge('6e19d7', 1, '3074b2', 0);
  f.edge('3074b2', 0, '9ba70e', 0);
  f.edge('8cfd5d', 0, '9ba70e', 0);
}).start();