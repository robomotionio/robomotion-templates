import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Set Range', (f) => {
  f.node('c48841', 'Core.Flow.Begin', 'Begin', {})
    .then('d22722', 'Core.Excel.Open', 'Open Excel', {
    inPath: Message('excel_path'),
    outFileDescriptor: Message('excel_fd'),
    optCreate: true
  });
  f.node('bb3fb7', 'Core.Excel.SetRange', 'Set Range', {
    inFileDescriptor: Message('excel_fd'),
    inStartCell: Custom('A1'),
    inTable: Message('table'),
    optHeader: true,
    optTarget: 'specific-cell'
  });
  f.node('9fc7d8', 'Core.Excel.Save', 'Save Excel', {
    inFileDescriptor: Message('excel_fd'),
    inSaveFilePath: Message('excel_path')
  });
  f.node('817e74', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('9fc7d8', 0, 'bb3fb7', 0);
  f.edge('9fc7d8', 0, '817e74', 0);
  f.edge('d22722', 0, 'bb3fb7', 0);
});
