import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('5249d9f7-1890-49c4-b7db-02cfae5d031f', 'Duplicate Rows Remover', (f) => {
  f.node('5786da', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Duplicate Rows Remover\n\nThis template runs an *excel macro* to find and remove duplicate rows in excel file \n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.path field to the excel file.\n\n**3.** Set the msg.macroname field to the name of macro which remove the rows.'
  });
  f.node('8d912d', 'Core.Trigger.Inject', 'Inject', {})
    .then('c7c9fe', 'Core.Programming.Function', 'Config', {
    func: 'msg.path = \'C:/Users/user/Documents/duplicaterows.xlsm\';// Required (Path to excel file)\nmsg.macroname = \'DuplicateRowRemover\';// Required (Name of the macro which remove duplicate rows.)\nreturn msg;'
  })
    .then('ede70b', 'Robomotion.MsExcel.OpenExcel', 'Open Excel', {
    path: Message('path'),
    outApplicationId: Message('excel_fd'),
    optVisible: true
  })
    .then('5b836b', 'Robomotion.MsExcel.RunMacro', 'Run Macro', {
    applicationId: Message('excel_fd'),
    macroName: Message('macroname')
  })
    .then('779ad7', 'Robomotion.MsExcel.SaveExcel', 'Save Excel', {
    applicationId: Message('excel_fd'),
    path: Custom('')
  })
    .then('5ee94b', 'Robomotion.MsExcel.CloseExcel', 'Close Excel', { applicationId: Message('excel_fd') })
    .then('bee012', 'Core.Flow.Stop', 'Stop', {});
}).start();
