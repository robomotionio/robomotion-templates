import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('266aff6e-8dc0-40bc-b582-43a43b851a44', 'Google Sheets New Rows Reader', (f) => {
  f.node('a0bcb5', 'Core.Flow.Comment', 'Comment', {
    optText: '## Google Sheets New Rows Reader\n\nThis template uses *Google Sheets* and *File System* nodes for reading new rows from a spreadsheet and writing to end of a txt file.\n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Google Sheets package icon, install it.\n\n**3.** You need to service account to use this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Google Sheets API have to be enabled in project which has the service account that you created, see [here](https://support.google.com/googleapi/answer/6158841?hl=en) for enable APIs.\n\n**6.** Go to Vaults and create new document item with this json key.\n\n**7.** Set this vault item to Open Spreadsheet node credentials.\n\n**8.** Edit the Config Node.\n\n**9.**  Set the msg.spreadsheetUrl field to the url of spreadsheet that you want to read rows.\n```js\nmsg.spreadsheetUrl = "https://docs.google.com/spreadsheets/d/your_spreadsheet_id/";\n```\n\n**10.**  Set the msg.textFilePath field to the path of text file.\n```js\nmsg.textFilePath = "C:/Users/user/Documents/sample.txt";\n```\n\n**11.** It checks spreadsheet every 20 seconds and you can change this from New Check Node\'s Delay After field.'
  });
  f.node('96c3ba', 'Core.Trigger.Inject', 'Start', {})
    .then('abce6e', 'Core.Programming.Function', 'Config', {
    func: 'msg.text = "";// Don\'t edit if not required.\nmsg.spreadsheetUrl = "https://docs.google.com/spreadsheets/d/your_spreadsheet_id/"; //Url of spreadsheet that you want to read rows.\nmsg.textFilePath = "C:/Users/user/Desktop/newrows.txt"; // Path of text file.\nreturn msg;'
  })
    .then('b394b1', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheetUrl'),
    outSpreadsheetId: Message('spreadsheet_id'),
    optCredentials: Credential({ vaultId: '31728a24-3a82-4978-9ee0-3a0502e949dd', itemId: '20214890-5be8-41f4-bf73-425d2fd57881' })
  });
  f.node('0a3071', 'Core.Flow.Label', 'Read Rows', {});
  f.node('6ed0c3', 'Robomotion.GoogleSheets.GetRange', 'Get Range', {
    inFromCell: Custom(''),
    inSpreadSheetId: Message('spreadsheet_id'),
    inToCell: Custom(''),
    outRange: Message('table'),
    optHeaders: false,
    optJsonify: false,
    optTarget: 'all-range'
  })
    .then('9ba246', 'Core.Programming.Function', 'Function', {
    func: 'if (msg.table.rows !== null){\n  if (msg.table.rows.length > msg.len){\n  msg.newRows = true;\n  var counter = msg.table.rows.length - msg.len;\n  while (counter > 0){\n  msg.text += JSON.stringify(msg.table.rows[msg.table.rows.length-counter]) + "\\n";\n  counter--;\n}\n} else {\n  msg.newRows = false;\n}\nmsg.len = msg.table.rows.length;\n} else {\n  msg.newRows = false;\n  msg.len = 0;\n}\n\nreturn msg;'
  })
    .then('ac891b', 'Core.Programming.Switch', 'New Check', {
    outputs: 2,
    optConditions: ['msg.newRows === true', 'msg.newRows === false'],
    delayAfter: 20
  });
  f.node('dc83c1', 'Core.FileSystem.WriteFile', 'Write File', {
    inPath: Message('textFilePath'),
    inText: Message('text'),
    optMode: 'append',
    optBase64: false
  });
  f.node('a440bd', 'Core.Flow.GoTo', 'Go To Read Rows', { optNodes: { ids: ['0a3071'], type: 'goto', all: false } });

  f.edge('ac891b', 0, 'dc83c1', 0);
  f.edge('ac891b', 1, 'a440bd', 0);
  f.edge('0a3071', 0, '6ed0c3', 0);
  f.edge('dc83c1', 0, 'a440bd', 0);
  f.edge('b394b1', 0, '6ed0c3', 0);
}).start();
