import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('80e5ffa9-3c8b-4fab-a21c-4f1c3bad7411', 'MySQL Table To Google Sheets', (f) => {
  f.node('0fa032', 'Core.Flow.Comment', 'Comment', {
    optText: '## MySQL Table to Google Sheets\nThis template uses *Google Sheets* and *MySQL* nodes for read range from a spreadsheet and write it to excel file. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Google Sheets and MySQL package icons, install them.\n\n**3.** You need to service account to use this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Google Sheets API have to be enabled in project which has the service account that you created, see [here](https://support.google.com/googleapi/answer/6158841?hl=en) for enable APIs.\n\n**6.** Go to Vaults and create new document item with this json key.\n\n**7.** Set this vault item to Open Spreadsheet node credentials.\n\n**8.** Go to Vaults and create new login item for mysql.\n\n**9.** Set this vault item to Connect node credentials.\n\n**10.** Edit the Config Node.\n'
  });
  f.node('9d5168', 'Core.Trigger.Inject', 'Start', {})
    .then('e0b6b7', 'Core.Programming.Function', 'Config', {
    func: 'msg.host = "localhost"; // Host Name.\nmsg.port = 3306; // Port Number.\nmsg.dbName = "Robomotion"; // Database Name.\nmsg.startCell = "D1"; // Start cell for writing table to spreadsheet.\nmsg.spreadsheetUrl = "https://docs.google.com/spreadsheets/d/106xw7X_W1A7LMlQYkMEprNXLqo4s9wrRxnqdDdtlHRg/"; // Url of spreadsheet.\nreturn msg;'
  })
    .then('ddc22a', 'Robomotion.MySQL.Connect', 'Connect', {
    outConnectionId: Message('conn_id'),
    optHostName: Message('host'),
    optPort: Message('port'),
    optDatabase: Message('dbName'),
    optCredentials: Credential({ vaultId: '31728a24-3a82-4978-9ee0-3a0502e949dd', itemId: '5fb7c9e2-5eed-490b-8c0a-ee75507e8098' })
  })
    .then('a3b2f8', 'Robomotion.MySQL.Start', 'Start Transaction', {
    connectionId: Message('conn_id'),
    outTransactionId: Message('trx_id')
  })
    .then('9f39e3', 'Robomotion.MySQL.NonQuery', 'Execute Non Query', {
    connectionId: Message('conn_id'),
    transactionId: Message('trx_id'),
    func: '-- ex: UPDATE users SET City = {{city}} WHERE ID = {{userId}};\n\n CREATE TABLE IF NOT EXISTS sheets (Name VARCHAR(20), Surname VARCHAR(20), Birthdate DATE);\n INSERT INTO sheets VALUES\n ("Michael","William","1996-09-08"),\n ("Richard","Smith","1971-10-08"),\n ("Christopher","Jones","1983-09-23"),\n ("Mark","Davies","1991-03-25"),\n ("Harry","Ackley","2000-06-18"),\n ("Emily","Banford","1989-05-12"),\n ("Evans","Cabell","1994-12-02");\n '
  })
    .then('1a95ec', 'Robomotion.MySQL.Query', 'Execute Query', {
    connectionId: Message('conn_id'),
    transactionId: Message('trx_id'),
    func: '-- ex: select ID, Name, Age, City  from users where ID = {{userId}};\n\nselect Name, Surname, Birthdate  from sheets;',
    outResult: Message('table')
  })
    .then('6de6f9', 'Robomotion.MySQL.Commit', 'Commit Transaction', { transactionId: Message('trx_id') })
    .then('7c8d06', 'Robomotion.MySQL.Disconnect', 'Disconnect', { connectionId: Message('conn_id') })
    .then('1a0633', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheetUrl'),
    outSpreadsheetId: Message('spreadsheet_id')
  })
    .then('228810', 'Robomotion.GoogleSheets.SetRange', 'Set Range', {
    inEndCell: Custom(''),
    inSpreadsheetId: Message('spreadsheet_id'),
    inStartCell: Message('startCell'),
    inTable: Message('table'),
    headers: true
  })
    .then('d45e18', 'Core.Flow.Stop', 'Stop', {});
}).start();
