import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Read the fasteners", (f) => {
  f.node('b8d001', 'Core.Flow.Begin', 'Begin', {})
    .then('b80007', 'Robomotion.JavaAutomation.SelectTab', "Open Products", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom("//page tab list"),
      inTabName: Custom("Products")
    })
    .then('b80008', 'Robomotion.JavaAutomation.SelectTreeNode', "Choose Fasteners", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom("//tree[name='Categories']"),
      inNodePath: Custom("All products/Hardware/Fasteners"),
      delayAfter: 3
    })
    .then('b80009', 'Robomotion.JavaAutomation.ExtractTable', "Read the fasteners", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom("//table[name='Products']"),
      outTable: Message("fasteners")
    })
    .then('b8d002', 'Core.Flow.End', 'End', {})
    ;
});
