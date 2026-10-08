import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Open Acme ERP and sign in', (f) => {
  f.node('b4b001', 'Core.Flow.Begin', 'Begin', {})
    .then('b4b007', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      outBrowserId: Message('browser_id')
    })
    .then('b4b008', 'Core.Browser.OpenLink', 'Open Acme ERP', {
      inBrowserId: Message('browser_id'),
      inUrl: Custom('https://acme-erp.robomotion.online/login'),
      outPageId: Message('page_id')
    })
    .then('b4b002', 'Core.Browser.TypeText', 'Type the user ID', {
      inPageId: Message('page_id'),
      inSelector: Custom("//input[@id='user-id']"),
      inText: Custom('trainee')
    })
    .then('b4b003', 'Core.Browser.TypeText', 'Type the password', {
      inPageId: Message('page_id'),
      inSelector: Custom("//input[@id='password']"),
      inText: Custom('AcmeTraining2026!')
    })
    .then('b4b004', 'Core.Browser.ClickElement', 'Sign in', {
      inPageId: Message('page_id'),
      inSelector: Custom("//button[normalize-space()='Sign in']")
    })
    .then('b4b005', 'Core.Browser.WaitElement', 'Wait for the dashboard', {
      inPageId: Message('page_id'),
      inSelector: Custom("//aside[@aria-label='Main navigation']//a[contains(., 'Customers')]")
    })
    .then('b4b009', 'Core.Browser.ClickElement', 'Open Customers', {
      inPageId: Message('page_id'),
      inSelector: Custom("//aside[@aria-label='Main navigation']//a[contains(., 'Customers')]")
    })
    .then('b4b006', 'Core.Flow.End', 'End', {})
    ;
});
