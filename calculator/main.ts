import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('37fa28c0-1fc5-4453-9b5c-89cc97b9bd9f', 'Calculator', (f) => {
  f.node('a3816b', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Calculator How-To \n\nThis template uses *Microsoft Excel* and *Windows* nodes to read operations from an excel file, \nmakes calculations using calculator and writes the results to the same file.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.calc_path field to the relative path of calculator process according to\nyour PATH environment variable.\n\n**3.** Set the msg.excel_path field to the full filepath of the excel file including\ncalculation operations.'
  });
  f.node('ad9988', 'Core.Trigger.Inject', 'Inject', {})
    .then('8927fb', 'Core.Programming.Function', 'Config', {
    func: 'msg.args = []; // Required (DO NOT edit if not necessary!)\nmsg.calc_path = \'calc.exe\'; // Required\nmsg.excel_path = \'C:\\\\Users\\\\user\\\\Documents\\\\excelcalculator.xlsx\'; // Required\n// Do not edit below.\nmsg.row_index = 2;\nreturn msg;'
  })
    .then('56699d', 'Core.Application.StartProcess', 'Start Calculator', {
    inFilePath: Message('calc_path'),
    inArguments: Message('args'),
    outPid: Message('pid'),
    outStdout: Message('stdout')
  })
    .then('22e8c0', 'Robomotion.MicrosoftExcel.OpenExcel', 'Open Excel', {
    path: Message('excel_path'),
    outApplicationId: Message('excel_fd'),
    optVisible: true
  })
    .then('5e4be5', 'Robomotion.MicrosoftExcel.GetRange', 'Get Range', {
    applicationId: Message('excel_fd'),
    fromCell: Custom(''),
    toCell: Custom(''),
    column: Message('table'),
    optHeaders: true
  })
    .then('bbd5de', 'Core.Flow.SubFlow', 'Calculation', { subflow: '751a8a12-8b7b-41af-81e2-1eeca46254dc' })
    .then('94bec7', 'Robomotion.MicrosoftExcel.SaveExcel', 'Save Excel', {
    applicationId: Message('excel_fd'),
    path: Custom('')
  })
    .then('a7adda', 'Robomotion.MicrosoftExcel.CloseExcel', 'Close Excel', { applicationId: Message('excel_fd') })
    .then('92f630', 'Core.Flow.Stop', 'Stop', {});
}).start();
