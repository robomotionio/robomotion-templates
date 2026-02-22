import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('5a3e9eb7-8455-4e02-9f6b-ae33c7df7375', 'Imported Fork Branch with Memory Queue', (f) => {
  f.addDependency('Robomotion.MemoryQueue', '0.0.1');

  f.node('894e4d', 'Core.Flow.Comment', 'Comment', { optText: '### Exception Handler\n\nWhen no items remain in the Memory Queue, the Dequeue node throws an exception. We catch this exception and mark the end of the branch\'s lifecycle using the WG Done node.\n' });
  f.node('b50310', 'Core.Flow.Comment', 'Comment', { optText: '### Initialize\n\nInitializes an array of e-commerce sites containing the website name, website URL, and screenshot file path.\n\nThis array is then passed to **Create Queue**, which creates a first-in, first-out queue that resides in the robot\'s memory.\n' });
  f.node('5e45ef', 'Core.Flow.Comment', 'Comment', { optText: '### Taking Screenshots with Fork Branch\n\nA Fork Branch creates parallel sequences that run at the same time. The number of branches determines how many parallel sequences will be created. For example, if it is set to 6, the robot will open 6 browsers in parallel and manage them concurrently.\n\nEach branch, whether it succeeds or fails, must end with a WG Done node. Every time a WG Done node is called, the Fork Branch marks one of the six branches as completed. The Fork Branch waits until all six branches have called WG Done. Only after all branches are completed does the Fork Branch continue execution through its bottom port.\n' });
  f.node('b30017', 'Core.Trigger.Inject', 'Start', {})
    .then('22d2ec', 'Core.Programming.Function', 'Set Sites', { func: '// Array of the 10 most popular e-commerce websites\nconst ecommerceWebsites = [\n  { name: "Amazon", url: "https://www.amazon.com" },\n  { name: "eBay", url: "https://www.ebay.com" },\n  { name: "AliExpress", url: "https://www.aliexpress.com" },\n  { name: "Walmart", url: "https://www.walmart.com" },\n  { name: "Etsy", url: "https://www.etsy.com" },\n  { name: "Shopify", url: "https://www.shopify.com" },\n  { name: "Target", url: "https://www.target.com" },\n  { name: "Alibaba", url: "https://www.alibaba.com" },\n  { name: "Rakuten", url: "https://www.rakuten.com" },\n  { name: "Zalando", url: "https://www.zalando.com" }\n];\n\nconst home = global.get("$Home$");\n\n// Map through the array to add the screenshot path for each website\nmsg.sites = ecommerceWebsites.map(site => ({\n  name: site.name,\n  url: site.url,\n  screenshot: `${home}/${site.name}.png`\n}));\n\nreturn msg;' })
    .then('435c24', 'Robomotion.MemoryQueue.Create', 'Create Queue', { optElements: Message('sites') })
    .then('51fef9', 'Core.Flow.ForkBranch', 'Fork Branch', { optNofBranches: Custom('6') })
    .then('ffab91', 'Core.Browser.Open', 'Open Browser', { optFullScreen: true });
  f.node('29799e', 'Core.Flow.Label', 'Next Site', {});
  f.node('49ac3d', 'Core.Trigger.Catch', 'Catch', { optNodes: { type: 'catch', ids: ['b830e2'], all: false } })
    .then('337921', 'Core.Browser.Close', 'Close Browser', {})
    .then('1eea09', 'Core.WaitGroup.Done', 'WG Done', {});
  f.node('540edc', 'Core.Flow.Stop', 'Stop', {});
  f.node('b830e2', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue', { outElement: Message('site') })
    .then('ab70e1', 'Core.Browser.OpenLink', 'Open Link', { inUrl: Message('site.url') })
    .then('c35d46', 'Core.Browser.Screenshot', 'Screenshot', { inSaveFilePath: Message('site.screenshot') })
    .then('c58cac', 'Core.Flow.GoTo', 'Go To Next Site', { optNodes: { ids: ['29799e'], type: 'goto', all: false } });

  f.edge('51fef9', 1, '540edc', 0);
  f.edge('ffab91', 0, 'b830e2', 0);
  f.edge('29799e', 0, 'b830e2', 0);
}).start();