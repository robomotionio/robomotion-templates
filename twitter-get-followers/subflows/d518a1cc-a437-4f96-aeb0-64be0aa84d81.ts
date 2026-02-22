import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Save Excel', (f) => {
  f.node('c6c8ea', 'Core.Flow.Begin', 'Begin', {})
    .then('e84fc6', 'Core.Excel.Open', 'Open Excel', {
    inPath: Message('excel_path'),
    outFileDescriptor: Message('excel_fd'),
    optCreate: true
  });
  f.node('717d99', 'Core.Excel.SetRange', 'Set Range', {
    inFileDescriptor: Message('excel_fd'),
    inStartCell: Custom('A1'),
    inTable: Message('table'),
    optTarget: 'specific-cell',
    optHeader: true
  });
  f.node('fde7ef', 'Core.Excel.Save', 'Save Excel', {
    inFileDescriptor: Message('excel_fd'),
    inSaveFilePath: Message('excel_path')
  });
  f.node('53b311', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('fde7ef', 0, '717d99', 0);
  f.edge('fde7ef', 0, '53b311', 0);
  f.edge('e84fc6', 0, '717d99', 0);
});
