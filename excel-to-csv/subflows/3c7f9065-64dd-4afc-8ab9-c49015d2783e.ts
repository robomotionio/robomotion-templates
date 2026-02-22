import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Excel', (f) => {
  f.node('dd7de4', 'Core.Flow.Begin', 'Begin', {})
    .then('d79aa7', 'Core.Excel.Open', 'Open Excel', {
    inPath: Message('excel_path'),
    outFileDescriptor: Message('excel_fd'),
    optCreate: false
  });
  f.node('6bfbc8', 'Core.Programming.Switch', 'Switch', {
    outputs: 2,
    optConditions: ['!Boolean(msg.sheet_name)', 'Boolean(msg.sheet_name)']
  });
  f.node('9a3670', 'Core.Excel.SwitchSheet', 'Switch To Sheet', {
    inFileDescriptor: Message('excel_fd'),
    inSheet: Message('sheet_name')
  })
    .then('ab10fc', 'Core.Excel.GetRange', 'Get Range', {
    inFileDescriptor: Message('excel_fd'),
    inFromCell: Custom(''),
    inToCell: Custom(''),
    outRange: Message('table'),
    optTarget: 'all-range'
  });
  f.node('5bc39e', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('16783d', 'Core.Excel.Close', 'Close Excel', { inFileDescriptor: Message('excel_fd') });

  f.edge('5bc39e', 0, '16783d', 0);
  f.edge('d79aa7', 0, '6bfbc8', 0);
  f.edge('6bfbc8', 1, '9a3670', 0);
  f.edge('ab10fc', 0, '6bfbc8', 0);
  f.edge('ab10fc', 0, '16783d', 0);
});
