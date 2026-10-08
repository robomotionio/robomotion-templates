import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Every customer from a CSV", (f) => {
  f.addDependency('Robomotion.WindowsAutomation', '0.21.10');

  f.node('b70001', 'Core.Trigger.Inject', 'Start', {});
  f.node('b70002', 'Core.CSV.ReadCSV', 'Read the new customers', {
    inFilePath: Custom("C:/Acme/in/customers-to-add.csv"),
    optHeaders: true,
    outTable: Message('customers')
  });
  f.node('b70003', 'Core.Flow.Label', 'Start Acme ERP', {});
  f.node('b70004', 'Core.Flow.SubFlow', 'Open Acme ERP and sign in', {});
  f.node('b70005', 'Core.Flow.Label', 'Next customer', {});
  f.node('b70006', 'Core.Programming.ForEach', 'For each customer', {
    optInput: Message('customers.rows'),
    optOutput: Message('customer')
  });
  f.node('b70007', 'Core.Flow.SubFlow', 'Add the customer', {});
  f.node('b70008', 'Core.Flow.GoTo', 'Go to the next customer', { optNodes: { ids: ['b70005'], type: 'goto', all: false } });
  f.node('b70009', 'Core.Flow.Stop', 'Stop', {});

  // A customer the app would not take: a picture of the window, a line in the log, and a
  // fresh Acme ERP for the next one (the half-filled form would ask to be saved).
  f.node('b7000a', 'Core.Trigger.Catch', 'If a customer fails', { optNodes: { type: 'catch', ids: ['b70007'], all: false } });
  f.node('b7000b', 'Robomotion.WindowsAutomation.Screenshot', 'Take a screenshot', {
    inSelector: Custom("//WindowControl[@id='frmMain']"),
    inFilePath: JS("\"C:/Acme/out/not-added-\" + msg.customer.name + \".png\"")
  });
  f.node('b7000c', 'Core.Flow.Log', 'Log the customer', {
    inText: JS("\"Could not add \" + msg.customer.name + \": \" + (msg.error && msg.error.message)"),
    optLevel: 'error'
  });
  f.node('b7000d', 'Robomotion.WindowsAutomation.CloseWindow', 'End Acme ERP', {
    inSelector: Custom("//WindowControl[@id='frmMain']"),
    optMethod: 'kill'
  });
  f.node('b7000e', 'Core.Flow.GoTo', 'Start again', { optNodes: { ids: ['b70003'], type: 'goto', all: false } });

  // A Label has no input: only a GoTo reaches it, and it leads on to the node after it.
  f.edge('b70001', 0, 'b70002', 0);
  f.edge('b70002', 0, 'b70004', 0);
  f.edge('b70003', 0, 'b70004', 0);
  f.edge('b70004', 0, 'b70006', 0);
  f.edge('b70005', 0, 'b70006', 0);
  f.edge('b70006', 0, 'b70007', 0);
  f.edge('b70007', 0, 'b70008', 0);
  f.edge('b70006', 1, 'b70009', 0);
  f.edge('b7000a', 0, 'b7000b', 0);
  f.edge('b7000b', 0, 'b7000c', 0);
  f.edge('b7000b', 0, 'b7000d', 0);
  f.edge('b7000d', 0, 'b7000e', 0);
}).start();
