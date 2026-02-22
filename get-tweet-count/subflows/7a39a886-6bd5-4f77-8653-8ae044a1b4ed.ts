import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Excel', (f) => {
  f.node('251e8d', 'Core.Flow.Begin', 'Begin', {})
    .then('60299d', 'Core.Excel.Open', 'Open Excel', {
    inPath: Message('excel_path'),
    outFileDescriptor: Message('excel_fd'),
    optCreate: false
  });
  f.node('0097fb', 'Core.Excel.GetRange', 'Get Range', {
    inFileDescriptor: Message('excel_fd'),
    inFromCell: Custom(''),
    inToCell: Custom(''),
    outRange: Message('table'),
    optTarget: 'all-range',
    optHeaders: true,
    optJsonify: true
  });
  f.node('aa1ad0', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('60299d', 0, '0097fb', 0);
  f.edge('aa1ad0', 0, '0097fb', 0);
});
