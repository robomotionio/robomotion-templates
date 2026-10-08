import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Windows dialogs and grids", (f) => {
  f.addDependency('Robomotion.WindowsAutomation', '0.21.8');
  f.node('b60001', 'Core.Trigger.Inject', 'Start', {})
    .then('b60002', 'Core.Flow.SubFlow', 'Open Acme ERP and sign in', {})
    .then('b60003', 'Robomotion.WindowsAutomation.SetText', 'Type a note, not saved', {
      inSelector: Custom("//EditControl[@id='txtNotes']"),
      inText: Custom('Call about the orders on hold.'),
      optClearFirst: false
    })
    .then('b60004', 'Robomotion.WindowsAutomation.SelectTab', 'Open Orders', {
      inSelector: Custom("//TabControl[@automationid='tabMain']"),
      inTab: Custom('Orders')
    })
    .then('b60005', 'Robomotion.WindowsAutomation.WaitElement', 'Wait for the orders', {
      inSelector: Custom("//TextControl[@automationid='lblLoading']"),
      optCondition: 'disappear'
    })
    .then('b60006', 'Robomotion.WindowsAutomation.GetTableData', 'Read the orders', {
      inSelector: Custom("//DataGridControl[@id='gridOrders']"),
      outTable: Message('table')
    })
    .then('b60007', 'Core.Programming.Function', 'Keep the orders on hold', {
      func: `msg.on_hold = msg.table.rows.filter((row) => row.Status === 'On hold');
return msg;`
    })
    .then('b60008', 'Core.Flow.SubFlow', 'Export the orders on hold', {})
    .then('b60009', 'Robomotion.WindowsAutomation.CloseWindow', 'Close Acme ERP', {
      inSelector: Custom("//WindowControl[starts-with(@class, 'WindowsForms10.Window.') and starts-with(@name, 'Acme ERP - [')]"),
      optMethod: 'close',
      inAnswer: Custom('No')
    })
    .then('b6000a', 'Core.Flow.Stop', 'Stop', {})
    ;
}).start();
