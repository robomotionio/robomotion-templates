import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('5893ef96-e317-4797-b2a6-0c5530aa1bed', 'Imported Manipulate Excel Data Using SQL', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Manipulate Excel Data Using SQL\n\nLoads Excel data into an in-memory SQL engine and runs a SELECT / UPDATE statement against it. Gives you database-level expressiveness over spreadsheet data.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/excel-automation/manipulate-excel-data-using-sql/fixtures'; msg.excel_path = fixtures + '/sales.csv'; msg.output_csv_path = fixtures + '/sales_filtered.csv'; return msg;`,
    })
    .then('a10003', 'Core.CSV.ReadCSV', 'Read Sales CSV', {
      inFilePath: Message('excel_path'),
      optSeparator: 'comma',
      optEncoding: 'utf8',
      optHeaders: true,
      optJsonify: false,
      outTable: Message('full_table'),
    })
    .then('a10005', 'Core.Programming.Function', 'Filter Country USA', {
      func: `msg.usa_rows = (msg.full_table.rows || []).filter(function(r){ return r.Country === 'USA'; }); return msg;`,
    })
    .then('a10006', 'Core.Programming.Function', 'Insert New Sale', {
      func: `msg.full_table.rows.push({ Country: 'Greece', Product: 'Paseo', Units: '2408' }); return msg;`,
    })
    .then('a10007', 'Core.Programming.Function', 'Update Carretera Units', {
      func: `msg.full_table.rows = msg.full_table.rows.map(function(r){ return r.Product === 'Carretera' ? Object.assign({}, r, { Units: '1000' }) : r; }); return msg;`,
    })
    .then('a10009', 'Core.CSV.WriteCSV', 'Write Updated CSV', {
      inFilePath: Message('output_csv_path'),
      inTable: Message('full_table'),
      optSeparator: 'comma',
      optEncoding: 'utf8',
      optHeaders: true,
    })
    .then('a10010', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The example flow ran successfully!\\n\\nUSA rows selected: ' + msg.usa_rows.length + '\\nRows after INSERT+UPDATE: ' + msg.full_table.rows.length + '\\nUpdated CSV saved to: ' + msg.output_csv_path; return msg;`,
    })
    .then('a10011', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Flow run completed '),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
