import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/excel-automation/consolidate-excel-reports/fixtures'; msg._dl_dir = fixtures; msg._dl_report_q1_csv = fixtures + '/report_q1.csv'; msg._dl_report_q1_xlsx = fixtures + '/report_q1.xlsx'; msg._dl_report_q2_csv = fixtures + '/report_q2.csv'; msg._dl_report_q2_xlsx = fixtures + '/report_q2.xlsx'; msg._dl_report_q3_csv = fixtures + '/report_q3.csv'; msg._dl_report_q3_xlsx = fixtures + '/report_q3.xlsx'; return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download report_q1.csv', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/consolidate-excel-reports/fixtures/report_q1.csv'),
      inPath: Message('_dl_report_q1_csv'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11005', 'Core.Net.Download', 'Download report_q1.xlsx', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/consolidate-excel-reports/fixtures/report_q1.xlsx'),
      inPath: Message('_dl_report_q1_xlsx'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11006', 'Core.Net.Download', 'Download report_q2.csv', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/consolidate-excel-reports/fixtures/report_q2.csv'),
      inPath: Message('_dl_report_q2_csv'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11007', 'Core.Net.Download', 'Download report_q2.xlsx', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/consolidate-excel-reports/fixtures/report_q2.xlsx'),
      inPath: Message('_dl_report_q2_xlsx'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11008', 'Core.Net.Download', 'Download report_q3.csv', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/consolidate-excel-reports/fixtures/report_q3.csv'),
      inPath: Message('_dl_report_q3_csv'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11009', 'Core.Net.Download', 'Download report_q3.xlsx', {
      inUrl: Custom('https://public-files.robomotion.io/templates/excel-automation/consolidate-excel-reports/fixtures/report_q3.xlsx'),
      inPath: Message('_dl_report_q3_xlsx'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
