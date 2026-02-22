import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Excel', (f) => {
  f.node('ac3e7d', 'Core.Flow.Begin', 'Begin', {})
    .then('f55c5d', 'Core.Excel.Open', 'Open Excel', {
    inPath: Message('excel_path'),
    outFileDescriptor: Message('excel_fd'),
    optCreate: false
  });
  f.node('d5547c', 'Core.Programming.Switch', 'Switch', {
    outputs: 2,
    optConditions: ['!Boolean(msg.sheet_name)', 'Boolean(msg.sheet_name)']
  });
  f.node('6ba573', 'Core.Excel.SwitchSheet', 'Switch To Sheet', {
    inFileDescriptor: Message('excel_fd'),
    inSheet: Message('sheet_name')
  })
    .then('7a82e6', 'Core.Excel.GetRange', 'Get Range', {
    inFileDescriptor: Message('excel_fd'),
    inFromCell: Custom(''),
    inToCell: Custom(''),
    outRange: Message('table'),
    optTarget: 'all-range',
    optHeaders: true,
    optJsonify: true
  });
  f.node('bd6748', 'Core.Excel.Close', 'Close Excel', { inFileDescriptor: Message('excel_fd') })
    .then('2c1681', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('f55c5d', 0, 'd5547c', 0);
  f.edge('d5547c', 1, '6ba573', 0);
  f.edge('7a82e6', 0, 'd5547c', 0);
  f.edge('7a82e6', 0, 'bd6748', 0);
});
