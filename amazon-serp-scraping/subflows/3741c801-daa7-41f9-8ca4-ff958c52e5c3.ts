import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Link', (f) => {
  f.node('807caf', 'Core.Flow.Begin', 'Begin', {})
    .then('06bf47', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('product.link'),
    outPageId: Message('page_id'),
    optSameTab: true
  })
    .then('833210', 'Core.Browser.GetValue', 'Product Title', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="productTitle"]'),
    inAttribute: Custom(''),
    outValue: Message('productTitle')
  })
    .then('c866bd', 'Core.Browser.GetValue', 'About this item', {
    inAttribute: Custom(''),
    inPageId: Message('page_id'),
    inSelector: Custom('#feature-bullets'),
    inSelectorType: 'css',
    outValue: Message('featuredBullett'),
    continueOnError: true
  })
    .then('f71ded', 'Core.Browser.RunScript', 'Get Price', {
    func: 'var p = document.evaluate("//span[@data-a-color=\'price\']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\nreturn p ? p.innerText.split("\\n")[0] : "";\n',
    inPageId: Message('page_id'),
    outResult: Message('productPrice')
  })
    .then('8ba325', 'Core.Browser.GetValue', 'Product Image', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//img[@id=\'landingImage\']'),
    inAttribute: Custom('src'),
    outValue: Message('productImage')
  })
    .then('722977', 'Core.Browser.GetValue', 'Product Description', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//div[@id=\'productDescription\']'),
    inAttribute: Custom(''),
    outValue: Message('productDescription'),
    continueOnError: true
  })
    .then('9b9952', 'Core.Browser.GetValue', 'Product Description 2', {
    inAttribute: Custom(''),
    inPageId: Message('page_id'),
    inSelector: Custom('//div[@id=\'aplus\']'),
    inSelectorType: 'xpath:position',
    outValue: Message('productDescription2'),
    continueOnError: true
  })
    .then('f43c85', 'Core.Programming.Function', 'Build product table', {
    func: '// We extract product id from the link for having a unique id, ex: B0862Y45TC\nvar id = msg.product.link;\nvar results = msg.product.link.match(/dp\\/(.*?)\\//);\nif (results && results.length > 1) { id = results[1]; }\n\nmsg.table = {\n  columns:["productTitle", "productPrice", "featuredBullett", "productDescription", "productDescription2", "productLink", "productImage"],\n  rows:[\n    {\n      "id": id, // Unique ID\n      "productTitle": msg.productTitle,\n      "productPrice": msg.productPrice,\n      "featuredBullett": msg.featuredBullett,\n      "productDescription": msg.productDescription,\n      "productDescription2": msg.productDescription2,\n      "productLink": msg.product.link,\n      "productImage": msg.productImage\n    }\n  ]\n};\n\nreturn msg;'
  })
    .then('0e5e27', 'Robomotion.SQLite.Insert', 'Insert Product', {
    inConnectionId: Message('conn_id'),
    inTransactionId: Message('trx_id'),
    inDatabaseTable: Custom('products'),
    inTable: Message('table'),
    optReplace: true
  })
    .then('d5729a', 'Core.Programming.Function', 'Clear', {
    func: 'delete msg.table;\ndelete msg.productTitle;\ndelete msg.productPrice;\ndelete msg.featuredBullett;\ndelete msg.productDescription;\ndelete msg.productDescription2;\ndelete msg.productLink;\ndelete msg.affiliateTag;\ndelete msg.productImage;\n\nreturn msg;\n\n'
  })
    .then('84b8da', 'Core.Flow.End', 'End', { sfPort: 0 });
});
