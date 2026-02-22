import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Spreadsheet', (f) => {
  f.node('6e19f3', 'Core.Flow.Begin', 'Begin', {});
  f.node('534e57', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', {
    inUrl: Message('spreadsheetUrl'),
    outSpreadsheetId: Message('spreadsheet_id')
  });
  f.node('3e8625', 'Robomotion.GoogleSheets.SetCellValue', 'Set Cell Value', {
    inCellName: Message('cellIssued'),
    inCellValue: Custom('Issued'),
    inSpreadsheetId: Message('spreadsheet_id')
  });
  f.node('7ca400', 'Robomotion.GoogleSheets.SetCellValue', 'Set Cell Value', {
    inCellName: Message('cellResult'),
    inCellValue: Message('value'),
    inSpreadsheetId: Message('spreadsheet_id')
  });
  f.node('723e93', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('3e8625', 0, '534e57', 0);
  f.edge('7ca400', 0, '3e8625', 0);
  f.edge('6e19f3', 0, '534e57', 0);
  f.edge('7ca400', 0, '723e93', 0);
});
