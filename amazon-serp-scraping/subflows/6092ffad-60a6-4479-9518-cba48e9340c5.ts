import { subflow, Message } from '@robomotion/sdk';

subflow.create('Scrape Products', (f) => {
  f.node('8c022c', 'Core.Flow.Begin', 'Begin', {})
    .then('b66d5b', 'Core.Browser.RunScript', 'Scrape Products', {
    func: 'var containers = [...document.querySelectorAll("h2")];\n\nvar products = containers.map(x => \n  ({\n    "link": x.querySelector("a") ? x.querySelector("a").href : "",\n  })\n);\n\nproducts = products.filter(p => p.link !== "");\n\nreturn products;\n',
    inPageId: Message('root_page_id'),
    outResult: Message('products')
  })
    .then('532a8c', 'Core.Programming.ForEach', 'For Each Product', {
    outputs: 2,
    optInput: Message('products'),
    optOutput: Message('product')
  });
  f.node('af71d3', 'Core.Flow.Label', 'Next Product', {});
  f.node('12674e', 'Core.Flow.SubFlow', 'Scrape Product', { subflow: '3741c801-daa7-41f9-8ca4-ff958c52e5c3' })
    .then('9d5932', 'Core.Flow.GoTo', 'Go To Next Product', { optNodes: { ids: ['af71d3'], type: 'goto', all: false } });
  f.node('16bdf9', 'Core.Browser.CloseWindow', 'Close Window', {
    inPageId: Message('page_id'),
    continueOnError: true
  });
  f.node('f6886c', 'Core.Programming.Function', 'Clear', { func: 'delete msg.page_id;\nreturn msg;' });
  f.node('bc0977', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('532a8c', 0, '12674e', 0);
  f.edge('532a8c', 0, 'af71d3', 0);
  f.edge('f6886c', 0, '16bdf9', 0);
  f.edge('f6886c', 0, 'bc0977', 0);
  f.edge('532a8c', 1, '16bdf9', 0);
});
