import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Open Acme ERP and sign in', (f) => {
  f.node('b5b001', 'Core.Flow.Begin', 'Begin', {})
    .then('b5b007', 'Robomotion.WebAutomation.OpenBrowser', 'Open Browser', {
      optBrowserType: 'edge',
      outBrowserID: Message('browser_id')
    })
    .then('b5b008', 'Robomotion.WebAutomation.OpenLink', 'Open Acme ERP', {
      inBrowserID: Message('browser_id'),
      inURL: Custom('https://acme-erp.robomotion.online/login')
    })
    .then('b5b002', 'Robomotion.WebAutomation.TypeText', 'Type the user ID', {
      inBrowserID: Message('browser_id'),
      inSelector: Custom("//input[@id='user-id']"),
      inText: Custom('trainee'),
      optTimeout: Custom(15)
    })
    .then('b5b003', 'Robomotion.WebAutomation.TypeText', 'Type the password', {
      inBrowserID: Message('browser_id'),
      inSelector: Custom("//input[@id='password']"),
      inText: Custom('AcmeTraining2026!')
    })
    .then('b5b004', 'Robomotion.WebAutomation.ClickElement', 'Sign in', {
      inBrowserID: Message('browser_id'),
      inSelector: Custom("//button[normalize-space()='Sign in']")
    })
    .then('b5b009', 'Robomotion.WebAutomation.ClickElement', 'Open Customers', {
      inBrowserID: Message('browser_id'),
      inSelector: Custom("//aside[@aria-label='Main navigation']//a[contains(., 'Customers')]"),
      optTimeout: Custom(15)
    })
    .then('b5b006', 'Core.Flow.End', 'End', {})
    ;
});
