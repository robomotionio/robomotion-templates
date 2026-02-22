import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('cc0c6399-3f10-4e33-8cbc-b1624ce73747', 'Excel Copy Paste', (f) => {
  f.node('e1082c', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Excel Copy Paste\n\nThis template shows copy and paste between sheets in excel file \n\n###### How it Works?\n\n**1.** Edit the Config Node.\n\n**2.** Set the msg.path field to the excel file.\n\n**3.** If not required don\'t edit other sheet fields in Config node.\n'
  });
  f.node('ee5690', 'Core.Trigger.Inject', 'Start', {})
    .then('db3b05', 'Core.Programming.Function', 'Config', {
    func: 'msg.path = \'C:\\\\Users\\\\user\\\\Documents\\\\excelcopypaste.xlsx\';// Path to excel file.\nmsg.firstsheet = \'Person\';\nmsg.secondsheet = \'Info\';\nmsg.resultsheet = \'Result\';\nreturn msg;'
  })
    .then('b284ab', 'Robomotion.MicrosoftExcel.OpenExcel', 'Open Excel', {
    path: Message('path'),
    outApplicationId: Message('excel_fd'),
    optVisible: true
  })
    .then('f92f72', 'Robomotion.MicrosoftExcel.ActivateSheet', 'Activate Sheet', {
    applicationId: Message('excel_fd'),
    sheetName: Message('firstsheet')
  })
    .then('c0cf5b', 'Robomotion.MicrosoftExcel.CopyRange', 'Copy Range', {
    applicationId: Message('excel_fd'),
    range: Custom('A1:B6')
  })
    .then('d4203c', 'Robomotion.MicrosoftExcel.ActivateSheet', 'Activate Sheet', {
    applicationId: Message('excel_fd'),
    sheetName: Message('resultsheet')
  })
    .then('23f213', 'Robomotion.MicrosoftExcel.PasteRange', 'Paste Range', {
    applicationId: Message('excel_fd'),
    range: Custom('A1:B6')
  })
    .then('4c3f07', 'Robomotion.MicrosoftExcel.ActivateSheet', 'Activate Sheet', {
    applicationId: Message('excel_fd'),
    sheetName: Message('secondsheet')
  })
    .then('fe77a1', 'Robomotion.MicrosoftExcel.CopyRange', 'Copy Range', {
    applicationId: Message('excel_fd'),
    range: Custom('A1:B6')
  })
    .then('59cfe6', 'Robomotion.MicrosoftExcel.ActivateSheet', 'Activate Sheet', {
    applicationId: Message('excel_fd'),
    sheetName: Message('resultsheet')
  })
    .then('86a849', 'Robomotion.MicrosoftExcel.PasteRange', 'Paste Range', {
    applicationId: Message('excel_fd'),
    range: Custom('C1:D6')
  })
    .then('dfc4a9', 'Robomotion.MicrosoftExcel.SaveExcel', 'Save Excel', {
    applicationId: Message('excel_fd'),
    path: Custom('')
  })
    .then('41ee4e', 'Robomotion.MicrosoftExcel.CloseExcel', 'Close Excel', { applicationId: Message('excel_fd') })
    .then('dbd59d', 'Core.Flow.Stop', 'Stop', {});
}).start();
