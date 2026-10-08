import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Headless Chrome", (f) => {
  f.node('b40001', 'Core.Trigger.Inject', 'Start', {})
    .then('b40004', 'Core.Flow.SubFlow', 'Open Acme ERP and sign in', {})
    .then('b40006', 'Core.Browser.TypeText', 'Type the customer', {
      inPageId: Message('page_id'),
      inSelector: Custom("//input[@aria-label='Search customers']"),
      inText: Custom('Smith')
    })
    .then('b40007', 'Core.Browser.ClickElement', 'Click Search', {
      inPageId: Message('page_id'),
      inSelector: Custom("//button[normalize-space(.)='Search']")
    })
    .then('b40008', 'Core.Programming.Sleep', 'Look at the result', { optDuration: Custom('2') })
    .then('b40009', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('b4000a', 'Core.Flow.Stop', 'Stop', {})
    ;
}).start();
