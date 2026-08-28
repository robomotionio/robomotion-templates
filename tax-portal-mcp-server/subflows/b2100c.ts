import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Read The Invoices", (f) => {
  f.node('e51001', 'Core.Flow.Begin', 'Begin', {})
    .then('e51002', 'Core.Browser.ClickElement', 'Open The Company', { inSelector: Message('selector'), optWaitTimeout: Custom('20'), delayAfter: 2 })
    .then('e51003', 'Core.Browser.ClickElement', 'Open The Invoices', { inSelector: Custom("//a[@data-testid='nav-e-invoices']"), optWaitTimeout: Custom('20') })
    .then('e51004', 'Core.Browser.ScrapeTable', 'Read The Invoices', { inSelector: Custom('//table'), outTable: Message('invoices'), optWaitTimeout: Custom('20') })
    .then('e51005', 'Core.Flow.End', 'End', { sfPort: 0 })
    ;
});
