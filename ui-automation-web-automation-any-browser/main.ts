import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Any browser: Edge and Firefox", (f) => {
  f.addDependency('Robomotion.WebAutomation', '1.11.4');
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Any browser: Edge and Firefox\n\nA browser flow built from Web Automation nodes that signs in to Acme ERP Web and searches the customers, run on a robot in Edge and then in Firefox, with only the Browser Type changed.' });

  f.node('b50001', 'Core.Trigger.Inject', 'Start', {})
    .then('b50004', 'Core.Flow.SubFlow', 'Open Acme ERP and sign in', {})
    .then('b50006', 'Robomotion.WebAutomation.TypeText', 'Type the customer', {
      inBrowserID: Message('browser_id'),
      inSelector: Custom("//input[@aria-label='Search customers']"),
      inText: Custom('Smith')
    })
    .then('b50007', 'Robomotion.WebAutomation.ClickElement', 'Click Search', {
      inBrowserID: Message('browser_id'),
      inSelector: Custom("//button[normalize-space(.)='Search']")
    })
    .then('b50008', 'Core.Programming.Sleep', 'Look at the result', { optDuration: Custom('2') })
    .then('b50009', 'Robomotion.WebAutomation.CloseBrowser', 'Close Browser', {
      inBrowserID: Message('browser_id')
    })
    .then('b5000a', 'Core.Flow.Stop', 'Stop', {})
    ;
}).start();
