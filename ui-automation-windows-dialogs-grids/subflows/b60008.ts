import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Export the orders on hold', (f) => {
  f.node('b6c001', 'Core.Flow.Begin', 'Begin', {})
    .then('b6c002', 'Robomotion.WindowsAutomation.SetCombobox', 'Show the orders on hold', {
      inSelector: Custom("//ComboBoxControl[@automationid='cboStatus']"),
      inValue: Custom('On hold')
    })
    .then('b6c003', 'Robomotion.WindowsAutomation.Click', 'Click Export', {
      inSelector: Custom("//ButtonControl[@automationid='btnExport']"),
      optShowWindow: true
    })
    .then('b6c004', 'Robomotion.WindowsAutomation.SetText', 'Type the file name', {
      inSelector: Custom("//EditControl[@automationid='1001']"),
      inText: Custom('C:\\Acme\\out\\on-hold-orders.csv'),
      optEmulateTyping: true
    })
    .then('b6c005', 'Robomotion.WindowsAutomation.Click', 'Click Save', {
      inSelector: Custom("//ButtonControl[@automationid='1']"),
      optShowWindow: true
    })
    .then('b6c006', 'Robomotion.WindowsAutomation.Click', 'Replace it: Yes', {
      inSelector: Custom("//WindowControl[@name='Confirm Save As']//ButtonControl[@name='Yes']"),
      optShowWindow: true,
      optWaitTimeout: 5,
      continueOnError: true
    })
    .then('b6c007', 'Core.Flow.End', 'End', {})
    ;
});
