import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('c75e7bcb-ca05-4dfb-9f56-d035dbc9dcea', 'Excel Range to Word Table', (f) => {
  f.node('fc6996', 'Core.Flow.Comment', 'Comment', {
    optText: '## Excel Range to Word Table\n\nThis template uses *Microsoft Word* and *Microsoft Excel* nodes for add table from an excel document to a word document. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press packages icon above the node palette.\n\n**2.** You should see Microsoft Word and Microsoft Excel package icons, install them.\n\n**3.** Edit the Config Node.\n'
  });
  f.node('b1e49c', 'Core.Trigger.Inject', 'Start', {})
    .then('7e63d8', 'Core.Programming.Function', 'Config', {
    func: 'msg.excelpath = "C:/Users/user/Documents/birthdays.xlsx"; //Path of excel file for reading table.\nmsg.newwordpath = "C:/Users/user/Documents/tableword.docx"; //Path of word document for creating a word document.\nmsg.fromcell = "A1"; // First cell of range.\nmsg.tocell = "C8"; // Last cell of range.\nreturn msg;'
  })
    .then('321a5c', 'Robomotion.MicrosoftExcel.OpenExcel', 'Open Excel', {
    path: Message('excelpath'),
    outApplicationId: Message('excel_fd'),
    optVisible: true
  })
    .then('5cc684', 'Robomotion.MicrosoftExcel.GetRange', 'Get Range', {
    applicationId: Message('excel_fd'),
    fromCell: Message('fromcell'),
    toCell: Message('tocell'),
    column: Message('table'),
    optHeaders: true
  })
    .then('1d851c', 'Robomotion.MicrosoftExcel.CloseExcel', 'Close Excel', { applicationId: Message('excel_fd') })
    .then('c04150', 'Robomotion.MicrosoftWord.CreateWord', 'Create Word', { path: Message('newwordpath') })
    .then('e5b747', 'Robomotion.MicrosoftWord.OpenWord', 'Open Word', {
    path: Message('newwordpath'),
    outApplicationId: Message('word_fd'),
    optVisible: true
  })
    .then('7142ec', 'Robomotion.MicrosoftWord.AddTable', 'Add Table', {
    applicationId: Message('word_fd'),
    table: Message('table'),
    spaceAfter: Custom('0'),
    optHeaders: true
  })
    .then('cb7b63', 'Robomotion.MicrosoftWord.CloseWord', 'Close Word', {
    applicationId: Message('word_fd'),
    saveAsPath: Custom(''),
    optSaveChanges: true,
    saveAs: '_'
  })
    .then('56d57c', 'Core.Flow.Stop', 'Stop', {});
}).start();
