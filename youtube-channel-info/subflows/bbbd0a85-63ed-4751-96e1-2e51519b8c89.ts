import { subflow, Message } from '@robomotion/sdk';

subflow.create('Get Link 1', (f) => {
  f.node('3efbd2', 'Core.Flow.Begin', 'Begin', {})
    .then('177e2c', 'Core.Browser.RunScript', 'Get Link 1', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = \'//*[@id="link-list-container"]/a[1]\';\nvar elem = getElementByXpath(path);\nmsg.link1 = elem.getAttribute("href");\nreturn msg;',
    inPageId: Message('page_id'),
    outResult: Message('link1')
  })
    .then('59479f', 'Core.Browser.RunScript', 'Get Link 2', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = \'//*[@id="link-list-container"]/a[2]\';\nvar elem = getElementByXpath(path);\nmsg.link2 = elem.getAttribute("href");\nreturn msg;',
    inPageId: Message('page_id'),
    outResult: Message('link2')
  })
    .then('5095a6', 'Core.Browser.RunScript', 'Get Link 3', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = \'//*[@id="link-list-container"]/a[3]\';\nvar elem = getElementByXpath(path);\nmsg.link3 = elem.getAttribute("href");\nreturn msg;',
    inPageId: Message('page_id'),
    outResult: Message('link3')
  })
    .then('bd47f0', 'Core.Browser.RunScript', 'Get Link 4', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = \'//*[@id="link-list-container"]/a[4]\';\nvar elem = getElementByXpath(path);\nmsg.link4 = elem.getAttribute("href");\nreturn msg;',
    inPageId: Message('page_id'),
    outResult: Message('link4')
  })
    .then('618e63', 'Core.Browser.RunScript', 'Get Link 5', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = \'//*[@id="link-list-container"]/a[5]\';\nvar elem = getElementByXpath(path);\nmsg.link5 = elem.getAttribute("href");\nreturn msg;',
    inPageId: Message('page_id'),
    outResult: Message('link5')
  })
    .then('ea0a70', 'Core.Browser.RunScript', 'Get Link 6', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = \'//*[@id="link-list-container"]/a[5]\';\nvar elem = getElementByXpath(path);\nmsg.link6 = elem.getAttribute("href");\nreturn msg;',
    inPageId: Message('page_id'),
    outResult: Message('link6')
  })
    .then('593c56', 'Core.Flow.End', 'End', { sfPort: 0 });
});
