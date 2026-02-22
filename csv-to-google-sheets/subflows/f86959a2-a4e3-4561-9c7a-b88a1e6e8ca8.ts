import { subflow, Credential, Custom, Message } from '@robomotion/sdk';

subflow.create('Set Range', (f) => {
  f.node('dd99c8', 'Core.Flow.Begin', 'Begin', {});
  f.node('0e155d', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheet_url'),
    outSpreadsheetId: Message('spreadsheet_id'),
    optCredentials: Credential({ vaultId: '86cb1daa-f574-41b6-ae22-ad8275b56135', itemId: 'c2f8793b-f5a7-469a-a7fc-2740d5816dc1' })
  });
  f.node('e43b9f', 'Robomotion.GoogleSheets.SetRange', 'Set Range', {
    inEndCell: Custom(''),
    inSpreadsheetId: Message('spreadsheet_id'),
    inStartCell: Custom(''),
    inTable: Message('table'),
    headers: false
  });
  f.node('c897cb', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('e43b9f', 0, '0e155d', 0);
  f.edge('dd99c8', 0, '0e155d', 0);
  f.edge('e43b9f', 0, 'c897cb', 0);
});
