import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Reading from a Java application", (f) => {
  f.addDependency('Robomotion.JavaAutomation', '2.2.3');
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
