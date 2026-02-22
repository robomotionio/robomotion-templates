import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('31766bcb-a122-4c3f-beed-4609801508c1', 'Google Sheets Range to Excel', (f) => {
  f.node('a0d270', 'Core.Flow.Comment', 'Comment', {
    optText: '## Google Sheets to Range to Excel\nThis template uses *Google Sheets* and *Microsoft Excel* nodes for read range from a spreadsheet and write it to excel file. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Google Sheets and Microsoft Excel package icons, install them.\n\n**3.** You need to service account to use this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Google Sheets API have to be enabled in project which has the service account that you created, see [here](https://support.google.com/googleapi/answer/6158841?hl=en) for enable APIs.\n\n**6.** Go to Vaults and create new document item with this json key.\n\n**7.** Set this vault item to Open Spreadsheet node credentials.\n\n**8.** Edit the Config Node.\n'
  });
  f.node('360ea6', 'Core.Trigger.Inject', 'Start', {})
    .then('ded149', 'Core.Programming.Function', 'Config', {
    func: 'msg.spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1NMYbAxnz2ste01KOjtz9WKGSSr-nB-luVATWFOg-RbE/"; // Url of spreadsheet.\nmsg.fromCell = "A1"; // Start of the range.\nmsg.toCell = "C8"; // End of the range.\nmsg.excelFilePath = "C:/Users/user/Desktop/birthdays.xlsx"; // Excel file path for set range.\nmsg.startCell = "A1"; // Start of Excel Range.\nreturn msg;'
  })
    .then('3ee831', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheetUrl'),
    outSpreadsheetId: Message('spreadsheet_id')
  })
    .then('9da032', 'Robomotion.GoogleSheets.GetRange', 'Get Range', {
    inFromCell: Message('fromCell'),
    inSpreadSheetId: Message('spreadsheet_id'),
    inToCell: Message('toCell'),
    outRange: Message('table'),
    optHeaders: true,
    optJsonify: false,
    optTarget: 'all-range'
  })
    .then('b17138', 'Robomotion.MicrosoftExcel.OpenExcel', 'Open Excel', {
    path: Message('excelFilePath'),
    outApplicationId: Message('excel_fd'),
    optVisible: true
  })
    .then('f3ea0f', 'Robomotion.MicrosoftExcel.SetRange', 'Set Range', {
    applicationId: Message('excel_fd'),
    startCell: Message('startCell'),
    range: Message('table'),
    optHeaders: true,
    delayAfter: 3
  })
    .then('82b1b6', 'Robomotion.MicrosoftExcel.SaveExcel', 'Save Excel', {
    applicationId: Message('excel_fd'),
    path: Custom('')
  })
    .then('7bdcc4', 'Robomotion.MicrosoftExcel.CloseExcel', 'Close Excel', { applicationId: Message('excel_fd') })
    .then('16988b', 'Core.Flow.Stop', 'Stop', {});
}).start();
