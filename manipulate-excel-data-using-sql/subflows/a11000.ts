import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/excel-automation/manipulate-excel-data-using-sql/fixtures';
msg._dl_dir = fixtures;
msg._dl_sales_csv = fixtures + '/sales.csv';
msg._dl_sales_xlsx = fixtures + '/sales.xlsx';
return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download sales.csv', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/manipulate-excel-data-using-sql/fixtures/sales.csv'),
      inPath: Message('_dl_sales_csv'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11005', 'Core.Net.Download', 'Download sales.xlsx', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/manipulate-excel-data-using-sql/fixtures/sales.xlsx'),
      inPath: Message('_dl_sales_xlsx'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
