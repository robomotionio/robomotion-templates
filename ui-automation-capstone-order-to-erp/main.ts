import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

// The finance system's customer search, and its Overdue line with its label.
const IMG_CUSTOMER_SEARCH = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAaCAIAAABuNwZcAAAAwUlEQVR4nO2WQQ6EIAxFx8kchwVL7r9y6cIDuWjyrYUwgsT5Y/pjTCuV8qQ1TOsyvx6k968XMFjOwy3n4ZbzcMt5uPUxfogJ9pmjQ4iJ6oRx4GFbXIf2eivC6O2CHWKSS7uVIXH182KkSdHHY+vtq3JsuHoIttzhilGMHFIdzTyjEuc7oOfsnr+ZB9/yStaL71a094+Uwf2rKSYd0z8GaV3mHBIu2gN7pYPrwOcjWzX9+w/a6GnnA+fhlvNwy3m4tQFgS2ybN3eJogAAAABJRU5ErkJggg==";
const IMG_OVERDUE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAN4AAAAmCAIAAAAkxLKUAAAE2ElEQVR4Ae3BMYolSRIEUEvdjxKCiXZ/yUQT/Ch+gIWAhPx01zBsQ1XOTLx3dYyvLQoPHWNbFB46BrAobB0vCreOsS0KW8cAFoWHjhcFoGMAiwLQMYBF4aHjRQHoeFEAOgawKAAdA1gUHjpeFICO8d+2KNw6BrAofOp4UQA6xrYoAB1jWxQ+dYxtUQA6xrYoAB0DWBRuHWNbFG4d43Z1jH+1RQHoGMdtUR3jLy0KQMf4IVfH+DdaFG4d43hYVMf4S4vqGD/n6hjH8T5XxziO97k6xnG8z9UxjuN9ro5xHO9zdYzjeJ+rYxzH+1wd4zje5+oYx/E+V8c4jve5OsZxvM/VMf6xFtUxjj8wVMV4n6tjfKNFYesYf2xRHeOfY6iK8WmoivF/Gapi/IGhKsZtKGwV49NQeKgYwFDYKgYwFB4qxqehsFWMbShsFePh6hjfZVEdY1tUx/gzi+oY/xBDAagYrzEUbhUPVTG2oSrGF4aqeKiKsQ1VMR6GqhgPQ1WMbaiKh6oY21AV43Z1jG+xqI7xsKiOF9UxtkV1DGBR2DoGsKiOF9UxgEXh1vGiOsa2qI4BLApbx9gW1TF+1FAV49NQFQ+FW8UAhqoY21AVAxgKW8UAhqoYwFDYKgYwFLaK8YWhKh6qYvxiqIrxO0NVjE9DVYzbUBXj01AVYxuq4qEqxjZUxbhdHeNbLKpjPCyq40V1jG1RHS+qY2yL6nhRADoGsKiOsS2q40V1jG1RHS+qY2yL6hjAojrGjxqqYnwaquKhKsY2VMVDVYxtqIqHqhjbUBUPVfFQFeM2VMXYhqoYvzNUxUNVjE9DVYwvDFUxHoaqGA9DVYxPQ1WMbaiKh6oY21AV43Z1jG+xqI7xsKiOASyq40V1DGBReOh4UR1jW1TH2BbV8aI6xraojheFh47xDkNVjE9DVTxUxdiGqhjAUBUPVTGAoSrGNlTFQ1U8VMW4DYWHivGFobBVjNtQFeMLQ1WMh6EqxsNQFeMXQ1WMbaiKh6oY21AV43Z1jG+xqI7xsKiOASyq40V1DGBRHeNhUR1jW1TH2BbV8aI6xraojhfVMd5nqIrxaaiKh6oY21AVAxiq4qEqBjBUxdiGqnioioeqGLehKsbfM1TFQ1UMYKiK8bWhKsZtqIrxaaiK8YuhKsY2VMVDVYxtqIpxuzrGd1lUx9gW1TFui+oY26I6xraojhfVMbZFdYxtUR0vqmNsi+p4UR1jW1THABbVMX7UUBXj01AVD1UxtqEqxjZUxdiGqhjbUBUPVfFQFeM2VMXYhqoYwFAV4xdDVTxUxUNVjE9DVYxtqIpxG6pifBqqYjwMVTGAoSrGNlTFQ1WMbaiKcbs6xjdaFLaO8bCojnFbFLaOASyqY9wWhVvHABaFW8cAFoWtY2yL6hg/ZyhsFeNhqIqHqhjbUBVjG6pi3IbCVjGAoSoGMBS2igEMha1ibENVjIehcKsYwFB4qBjAUBVjG6pi3IbCQ8UAhqoYD0NVjG0obBVjGwpbxXi4OsbxHzBUxfjFUBXja0NVjG93dYzj326oivE7Q1WMLwxVMX7C1TGO432ujnEc73N1jON4n6tjHMf7XB3jON7n6hjH8T5XxziO97k6xnG8z9UxjuN9ro5xHO9zdYzjeJ+rYxzH+1wd4zje53/1CmJcsgtkCgAAAABJRU5ErkJggg==";

flow.create('main', "Putting it together", (f) => {
  f.addDependency('Robomotion.WindowsAutomation', '0.21.10');
  f.addDependency('Robomotion.ImageAutomation', '0.12.5');
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Putting it together\n\nOne flow over three systems. Headless Chrome reads today\'s web orders from Acme ERP Web, the finance system is asked about each customer over Remote Desktop, and the orders with nothing overdue are entered into Acme ERP for Windows, line by line, with a report at the end.' });

  f.node('c91001', 'Core.Trigger.Inject', "Start", {

    })
    .then('c91002', 'Core.Flow.SubFlow', "Read today's web orders", {

    })
    .then('c91003', 'Core.Programming.Function', "Group the orders", {
      func: `// One row per order line: group them into orders. The headers may come in capitals.
const t = msg.incoming || {};
const cols = t.columns || [];
const col = (want) => cols.find((c) => String(c).trim().toLowerCase() === want);
const kRef = col('web order'), kCust = col('customer'), kProd = col('product'), kQty = col('qty'), kTotal = col('line total');
if (!kRef || !kCust || !kProd || !kQty || !kTotal) throw new Error('Unexpected columns: ' + cols.join(', '));
const money = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
const byRef = {};
for (const r of t.rows || []) {
  const ref = r[kRef];
  const o = byRef[ref] || (byRef[ref] = {
    ref, customer: r[kCust], customerName: String(r[kCust]).replace(/ *[(][0-9]+[)]$/, ''), lines: [], total: 0,
  });
  o.lines.push({ product: r[kProd], qty: String(r[kQty]).trim() });
  o.total += money(r[kTotal]);
}
msg.orders = Object.values(byRef);
msg.results = [];
return msg;`
    })
    .then('c91004', 'Core.Flow.SubFlow', "Open the finance system", {

    })
    .then('c91005', 'Core.Flow.SubFlow', "Open Acme ERP", {

    })
    .then('c91031', 'Core.Flow.GoTo', "To the orders", {
      optNodes: { ids: ['c91006'], type: 'goto', all: false }
    })
    ;
  // For each web order: ask the finance system about the customer.
  f.node('c91006', 'Core.Flow.Label', "Next order", {

    })
    .then('c91007', 'Core.Programming.ForEach', "For each order", {
      optInput: Message("orders"),
      optOutput: Message("order")
    })
    .then('c91008', 'Robomotion.ImageAutomation.Window.FocusWindow', "Back to the finance system", {
      inTitle: Custom("Remote Desktop Connection"),
      optWaitTimeout: Custom("30")
    })
    .then('c91009', 'Robomotion.ImageAutomation.Image.ClickType', "Search the customer", {
      image: IMG_CUSTOMER_SEARCH,
      deltaX: 97,
      deltaY: 13,
      inText: Message("order.customerName"),
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optClear: true,
      optPressEnter: true,
      optVerify: true,
      optWindow: "Remote Desktop Connection"
    })
    .then('c91010', 'Robomotion.ImageAutomation.Screen.WaitScreenStable', "Wait for the search", {
      optChangeFirst: false,
      optTimeout: Custom("20"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c91011', 'Robomotion.ImageAutomation.OCR.GetTextNearImage', "Read Overdue", {
      regions: [{"x": 0, "y": 0, "width": 50.9009, "height": 100}, {"x": 56.3063, "y": 26.3158, "width": 43.6937, "height": 50}],
      image: IMG_OVERDUE,
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      outText: Message("overdue")
    })
    .then('c91012', 'Core.Programming.Function', "Anything overdue?", {
      outputs: 2,
      func: `// The finance system's Overdue line for this customer: "1 invoice, $2,727.00".
const text = String(msg.overdue || '');
if (!text.includes('$')) throw new Error('Could not read the Overdue line for ' + msg.order.customerName + ': "' + text + '"');
const amount = parseFloat(text.slice(text.indexOf('$')).replace(/[^0-9.]/g, '')) || 0;
if (amount > 0) {
  msg.results.push({
    web_order: msg.order.ref, customer: msg.order.customer, web_total: msg.order.total.toFixed(2),
    erp_order: '', result: 'Held: overdue ' + text.slice(text.indexOf('$')),
  });
  return [msg, null];
}
return [null, msg];`
    })
    ;
  // An overdue amount holds the order (port 0); otherwise it is entered (port 1).
  f.node('c91013', 'Core.Flow.GoTo', "Hold it: next order", {
      optNodes: { ids: ['c91006'], type: 'goto', all: false }
    })
    ;
  f.edge('c91012', 0, 'c91013', 0);
  f.node('c91014', 'Robomotion.WindowsAutomation.Click', "New order", {
      inSelector: Custom("//ButtonControl[@name='New order']"),
      optShowWindow: true
    })
    .then('c91015', 'Robomotion.WindowsAutomation.SetCombobox', "Choose the customer", {
      inSelector: Custom("//ComboBoxControl[@id='cboCustomer']"),
      inValue: Message("order.customer")
    })
    .then('c91032', 'Core.Flow.GoTo', "To the lines", {
      optNodes: { ids: ['c91016'], type: 'goto', all: false }
    })
    ;
  f.edge('c91012', 1, 'c91014', 0);
  // Each line: the product and the quantity in its row, then a new row.
  f.node('c91016', 'Core.Flow.Label', "Next line", {

    })
    .then('c91017', 'Core.Programming.ForEach', "For each line", {
      optInput: Message("order.lines"),
      optOutput: Message("line"),
      optIndex: Message("row")
    })
    .then('c91018', 'Robomotion.WindowsAutomation.SetCombobox', "Choose the product", {
      inSelector: JS("\"//ComboBoxControl[@name='Product Row \" + msg.row + \"']\""),
      inValue: Message("line.product")
    })
    .then('c91019', 'Robomotion.WindowsAutomation.SetText', "Type the quantity", {
      inSelector: JS("\"//DataItemControl[starts-with(@name, 'Qty Row \" + msg.row + \",')]\""),
      inText: Message("line.qty")
    })
    .then('c91020', 'Robomotion.WindowsAutomation.Click', "Add line", {
      inSelector: Custom("//ButtonControl[@id='btnAddLine']"),
      optShowWindow: true
    })
    .then('c91021', 'Core.Flow.GoTo', "Next line", {
      optNodes: { ids: ['c91016'], type: 'goto', all: false }
    })
    ;
  // Every line entered: save the order, check its total, and go on with the next.
  f.node('c91022', 'Robomotion.WindowsAutomation.GetText', "Read the order total", {
      inSelector: Custom("//TextControl[@id='lblTotal']"),
      outText: Message("order_total")
    })
    .then('c91023', 'Robomotion.WindowsAutomation.Click', "Save the order", {
      inSelector: Custom("//ButtonControl[@id='btnSaveOrder']"),
      optShowWindow: true
    })
    .then('c91024', 'Robomotion.WindowsAutomation.GetText', "Read the saved message", {
      inSelector: Custom("//WindowControl[@name='Acme ERP']//TextControl[@id='65535']"),
      outText: Message("saved_message")
    })
    .then('c91025', 'Robomotion.WindowsAutomation.Click', "Close the message", {
      inSelector: Custom("//WindowControl[@name='Acme ERP']//ButtonControl[@id='2']"),
      optShowWindow: true
    })
    .then('c91026', 'Core.Programming.Function', "Note the order", {
      func: `// The ERP's own total against the web's, and the number it gave the order.
const number = (/Order ([0-9]+)/.exec(msg.saved_message || '') || [])[1];
if (!number) throw new Error('Acme ERP did not confirm ' + msg.order.ref + ': "' + msg.saved_message + '"');
const erpTotal = parseFloat(String(msg.order_total || '').replace(/[^0-9.]/g, '')) || 0;
const same = Math.abs(erpTotal - msg.order.total) < 0.005;
msg.results.push({
  web_order: msg.order.ref, customer: msg.order.customer, web_total: msg.order.total.toFixed(2),
  erp_order: number, result: same ? 'Entered' : 'Entered, but the ERP total is ' + erpTotal.toFixed(2),
});
return msg;`
    })
    .then('c91027', 'Core.Flow.GoTo', "Next order", {
      optNodes: { ids: ['c91006'], type: 'goto', all: false }
    })
    ;
  f.edge('c91017', 1, 'c91022', 0);
  // Every order done: the report.
  f.node('c91028', 'Core.Programming.Function', "The report", {
      func: `msg.table = {
  columns: ['web_order', 'customer', 'web_total', 'erp_order', 'result'],
  rows: msg.results,
};
return msg;`
    })
    .then('c91029', 'Core.CSV.WriteCSV', "Write the report", {
      inTable: Message("table"),
      inFilePath: Custom("C:/Acme/out/capstone-orders.csv"),
      optHeaders: true
    })
    .then('c91030', 'Core.Flow.Stop', "Stop", {

    })
    ;
  f.edge('c91007', 1, 'c91028', 0);
}).start();
