import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('e2784722-65ac-45d3-98bd-90266437668d', 'Excel To CSV', (f) => {
  f.node('5aec16', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Excel To CSV How-To \n\nThis template uses *Excel* and *CSV* nodes to convert an Excel file to \na CSV (Comma Separated Value) file.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.csv_path field to the full filepath of .csv file you want to export.\n\n**3.** Set the msg.excel_path field to the full filepath of the excel file file you\nwant to convert.\n\n**4.** Set the msg.separator field to the separator value that will be used in .csv file\n(\',\' or \';\').\n\n**5.** Set the msg.sheet_name field to the sheet name you want to switch sheet, if exists,\nin excel file. (Optional)'
  });
  f.node('65b83e', 'Core.Trigger.Inject', 'Inject', {})
    .then('3ca065', 'Core.Programming.Function', 'Config', {
    func: 'msg.csv_path = \'/home/gursoy/Downloads/test.csv\'; // [Required]\nmsg.excel_path = \'/home/gursoy/Downloads/test.xls\'; // [Required]\nmsg.separator = \';\'; // [Required] - [, or ;]\nmsg.sheet_name = \'\'; // [Optional]\nreturn msg;'
  })
    .then('2235a0', 'Core.Flow.SubFlow', 'Read Excel', { subflow: '3c7f9065-64dd-4afc-8ab9-c49015d2783e' })
    .then('f9d516', 'Core.Flow.SubFlow', 'Write CSV', { subflow: 'b85f72ba-d1bd-4aa4-a55a-6f38f4dd5e27' })
    .then('d046e7', 'Core.Flow.Stop', 'Stop', {});
}).start();
