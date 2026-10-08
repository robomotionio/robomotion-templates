import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Reading from a Java application", (f) => {
  f.addDependency('Robomotion.JavaAutomation', '2.2.3');
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Reading from a Java application\n\nA flow that signs in to Acme ERP (Java Edition), reads a customer\'s credit limit and the fasteners in the product table, works out how many boxes of each the limit covers, and writes the answer to a CSV file.' });

  f.node('b80001', 'Core.Trigger.Inject', 'Start', {})
    .then('b80002', 'Core.Flow.SubFlow', 'Open Acme ERP and sign in', {})
    .then('b8000e', 'Core.Flow.SubFlow', "Look up Grace Hopper", {

    })
    .then('b8000f', 'Core.Flow.SubFlow', "Read the fasteners", {

    })
    .then('b8000a', 'Core.Programming.Function', "Boxes within her limit", {
      func: `const limit = parseFloat(msg.credit_limit);
msg.table = {
  columns: ['product', 'name', 'unit_price', 'boxes_within_limit'],
  rows: msg.fasteners.rows.map((row) => {
    const price = parseFloat(String(row.unit_price).replace(/[$,]/g, ''));
    return { product: row.product, name: row.name, unit_price: row.unit_price,
             boxes_within_limit: Math.floor(limit / price) };
  }),
};
return msg;`
    })
    .then('b8000b', 'Core.CSV.WriteCSV', "Write the file", {
      inTable: Message('table'),
      inFilePath: Custom("C:/Acme/out/grace-hopper-fasteners.csv"),
      optHeaders: true
    })
    .then('b8000c', 'Robomotion.JavaAutomation.CloseWindow', "Close Acme ERP", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\[")
    })
    .then('b8000d', 'Core.Flow.Stop', 'Stop', {})
    ;
}).start();
