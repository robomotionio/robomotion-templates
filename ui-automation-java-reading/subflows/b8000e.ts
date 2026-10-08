import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Look up Grace Hopper", (f) => {
  f.node('b8c001', 'Core.Flow.Begin', 'Begin', {})
    .then('b80003', 'Robomotion.JavaAutomation.SetText', "Type the customer", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom("//text[name='Search:']"),
      inText: Custom("Grace")
    })
    .then('b80004', 'Robomotion.JavaAutomation.ClickElement', "Click Find", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom("//push button[name='Find']")
    })
    .then('b80005', 'Robomotion.JavaAutomation.SelectListItem', "Select Grace Hopper", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom("//list[name='Customers']"),
      inValue: Custom("10013   Grace Hopper"),
      delayAfter: 3
    })
    .then('b80006', 'Robomotion.JavaAutomation.GetText', "Read the credit limit", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom("//text[name='Credit limit:']"),
      outText: Message("credit_limit")
    })
    .then('b8c002', 'Core.Flow.End', 'End', {})
    ;
});
