import { flow, Custom, JS, Message } from '@robomotion/sdk';

flow.create('e844412f-0b2e-4417-a775-e28a12ad72a1', 'Local Time', (f) => {
  f.node('321ea8', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Local Time How-To \n\nThis template uses *Dialog* and *Browser* to get a city name from the user and\nprint the local time out.\n\nYou can run the flow without any modifications.'
  });
  f.node('f44048', 'Core.Trigger.Inject', 'Inject', {})
    .then('0456a2', 'Core.Dialog.InputBox', 'City Input', {
    inText: Custom('Type a city you want to learn the local time'),
    inTitle: Custom('City Name'),
    outText: Message('city'),
    optDefault: Custom('istanbul')
  })
    .then('2e665f', 'Core.Programming.Function', 'Capitalize City', {
    func: 'function capitalize(word) {\n   return word.toLowerCase().split(\' \')\n    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(\' \');\n}\n\nmsg.city = capitalize(msg.city);\nreturn msg;'
  })
    .then('9ef5a6', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  })
    .then('b90731', 'Core.Browser.OpenLink', 'Go to Google', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Custom('https://www.google.com/'),
    outPageId: Message('page_id')
  })
    .then('c73ef3', 'Core.Browser.SetValue', 'Type City', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/input'),
    inValue: JS('"time in " + msg.city')
  })
    .then('17eb73', 'Core.Browser.ClickElement', 'Click Search', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/div[1]/div[3]/form/div[1]/div[1]/div[3]/center/input[1]')
  })
    .then('c5362a', 'Core.Browser.GetValue', 'Get Value', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="rso"]/div[1]/div/div/div[1]/div[1]'),
    inAttribute: Custom(''),
    outValue: Message('value')
  })
    .then('f9aa48', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('8558d2', 'Core.Dialog.MessageBox', 'Print the Time', {
    inText: JS('"The time in " + msg.city + " is currently " + msg.value'),
    inTitle: JS('"Local Time in " + msg.city')
  })
    .then('0dc991', 'Core.Flow.Stop', 'Stop', {});
}).start();
