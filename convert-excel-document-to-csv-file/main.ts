import { flow } from '@robomotion/sdk';

flow.create('cda9e3d2-f26d-42da-8879-e17548f56f94', 'Imported Convert Excel Document to CSV File', (f) => {
  f.node('da701d', 'Core.Flow.Comment', 'Comment', { optText: 'Convert Excel File to CSV File\n\nThis flow, converts given excel file to csv file. \n\nEdit Config file and;\n\n**1**- Provide a csv file path: msg.csv_path\n\n**2**- Provide a excel file to be converted: msg.excel_path\n\n**3**- Set seperator character: msg.separator\n\n' });
  f.node('aac848', 'Core.Trigger.Inject', 'Inject', {})
    .then('c4d3a4', 'Core.Programming.Function', 'config', { func: 'msg.csv_path = \'/home/robomotion/Downloads/test.csv\'; // [Required]\nmsg.excel_path = \'/home/robomotion/Downloads/test.xls\'; // [Required]\nmsg.separator = \';\'; // [Required] - [, or ;]\nmsg.sheet_name = \'\'; // [Optional]\nreturn msg;' })
    .then('6c4a5f', 'Core.Flow.SubFlow', 'Read Excel', {})
    .then('169916', 'Core.Flow.SubFlow', 'Write CSV', {})
    .then('72556b', 'Core.Flow.Stop', 'Stop', {});
}).start();