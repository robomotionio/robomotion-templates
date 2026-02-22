import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Set Range', (f) => {
  f.node('68c9cf', 'Core.Flow.Begin', 'Begin', {})
    .then('93b0ba', 'Core.Excel.SetRange', 'Set Range', {
    inFileDescriptor: Message('excel_fd'),
    inStartCell: Custom('A1'),
    inTable: Message('table'),
    optTarget: 'specific-cell',
    optHeader: true
  })
    .then('9c7187', 'Core.Excel.Save', 'Save Excel', {
    inFileDescriptor: Message('excel_fd'),
    inSaveFilePath: Message('excel_path')
  });
  f.node('5bfdaa', 'Core.Excel.Close', 'Close Excel', { inFileDescriptor: Message('excel_fd') });
  f.node('1faea3', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('1faea3', 0, '5bfdaa', 0);
  f.edge('9c7187', 0, '5bfdaa', 0);
});
