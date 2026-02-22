import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('e5cbda22-882f-4971-b6fb-1e79168e1952', 'Stock Prices With Google Sheets', (f) => {
  f.node('68bf0d', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Stock Prices How-To\n \n This template uses *Google Sheets* and *Browser* nodes to update stock prices in a spreadsheet.\n\n1. Go to Flow Designer and press package icon above the node palette.\n\n2. You should see Google Sheets package icon, install it.\n\n3. You need to service account to use this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n4. You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n5. Google Sheets API have to be enabled in project which has the service account that you created, see [here](https://support.google.com/googleapi/answer/6158841?hl=en) for enable APIs.\n\n6. Go to Vaults and create new document item with this json key.\n\n7. Set this vault item to Open Spreadsheet node credentials.\n\n8. Edit the Config Node.'
  });
  f.node('3b2f16', 'Core.Trigger.Inject', 'Start', {})
    .then('6f6d0e', 'Core.Programming.Function', 'Config', {
    func: 'msg.spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1WKhrXe2yeJIvIvJiJJrKDTepim1hT5AZcp7jmw-BZVo/";\nmsg.rownumber = 2; // Shouldn\'t edit.\nreturn msg;\n'
  })
    .then('b18460', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheetUrl'),
    outSpreadsheetId: Message('spreadsheet_id'),
    optCredentials: Credential({ vaultId: '31728a24-3a82-4978-9ee0-3a0502e949dd', itemId: '20214890-5be8-41f4-bf73-425d2fd57881' })
  })
    .then('3e398b', 'Robomotion.GoogleSheets.GetRange', 'Read All Symbols', {
    inFromCell: Custom(''),
    inSpreadSheetId: Message('spreadsheet_id'),
    inToCell: Custom(''),
    outRange: Message('table'),
    optHeaders: true,
    optJsonify: true,
    optTarget: 'all-range'
  })
    .then('b8ed3b', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  });
  f.node('930bdf', 'Core.Flow.Label', 'Next Symbol', {});
  f.node('04b175', 'Core.Programming.ForEach', 'For Each Symbol', {
    outputs: 2,
    optInput: Message('table.rows'),
    optOutput: Message('stock')
  });
  f.node('403a27', 'Core.Flow.SubFlow', 'Get Stock Price', { subflow: 'f12927a2-6a15-475a-826f-e4cce8770560' })
    .then('26705b', 'Core.Programming.Function', 'Set Cell', {
    func: 'msg.cell = "B" + msg.rownumber;\nmsg.rownumber += 1;\nreturn msg;'
  })
    .then('304209', 'Robomotion.GoogleSheets.SetCellValue', 'Set Cell Value', {
    inCellName: Message('cell'),
    inCellValue: Message('value'),
    inSpreadsheetId: Message('spreadsheet_id')
  })
    .then('1d08a9', 'Core.Flow.GoTo', 'Go To Next Symbol', { optNodes: { ids: ['930bdf'], type: 'goto', all: false } });
  f.node('e20313', 'Core.Flow.Stop', 'Stop', {});

  f.edge('b8ed3b', 0, '04b175', 0);
  f.edge('04b175', 0, '403a27', 0);
  f.edge('04b175', 1, 'e20313', 0);
  f.edge('930bdf', 0, '04b175', 0);
}).start();
