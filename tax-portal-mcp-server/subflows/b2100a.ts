import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Read The Company", (f) => {
  f.node('d41001', 'Core.Flow.Begin', 'Begin', {})
    .then('d41002', 'Core.Browser.ClickElement', 'Open The Company', { inSelector: Message('selector'), optWaitTimeout: Custom('20'), delayAfter: 2 })
    .then('d41003', 'Core.Browser.ClickElement', 'Open The Returns', { inSelector: Custom("//a[@data-testid='nav-filings']"), optWaitTimeout: Custom('20') })
    .then('d41004', 'Core.Browser.ScrapeTable', 'Read The Returns', { inSelector: Custom('//table'), outTable: Message('returns'), optWaitTimeout: Custom('20') })
    .then('d41005', 'Core.Browser.ClickElement', 'Open The Penalties', { inSelector: Custom("//a[@data-testid='nav-penalties']"), optWaitTimeout: Custom('20') })
    .then('d41006', 'Core.Browser.ScrapeTable', 'Read The Penalties', { inSelector: Custom('//table'), outTable: Message('penalties'), optWaitTimeout: Custom('20') })
    .then('d41007', 'Core.Flow.End', 'End', { sfPort: 0 })
    ;
});
