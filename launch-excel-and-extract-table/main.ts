import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('50bb5c21-7c70-4f7c-b284-6c697d5759a6', 'Imported Launch Excel and Extract Table', (f) => {
  f.addDependency('Robomotion.MicrosoftExcel', '1.10.2');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Launch Excel and Extract Table\n\nOpens an Excel workbook and reads its first table into a structured message variable. Ideal starting point for data-driven flows.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10002', 'Core.Programming.Function', 'Build Default Path', {
      func: `msg.default_excel_path = global.get('$Home$') + '/templates/excel-automation/launch-excel-and-extract-table/fixtures/sample.xlsx'; msg.retry_count = 0; return msg;`,
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Excel', {
      inTitle: Custom('Launch Excel and extract table'),
      inText: Custom('Select the excel file to extract table from...'),
      optDefault: Message('default_excel_path'),
      outText: Message('selected_file'),
    })
    .then('a10004', 'Core.Programming.Function', 'Validate', {
      outputs: 2,
      func: `return (msg.selected_file && /\\.xl\\w*$/i.test(msg.selected_file)) ? [msg, null] : [null, msg];`,
    });

  f.node('a10010', 'Core.Flow.GoTo', 'Enter Retry', {
    optNodes: { type: 'goto', ids: ['a10011'], all: false },
  });

  f.node('a10011', 'Core.Flow.Label', 'Retry Point', {})
    .then('a10005', 'Robomotion.MicrosoftExcel.OpenExcel', 'Open Excel', {
      path: Message('selected_file'),
      optVisible: true,
      outApplicationId: Message('excel_app_id'),
    })
    .then('a10006', 'Robomotion.MicrosoftExcel.GetRange', 'Read Used Range', {
      applicationId: Message('excel_app_id'),
      optRange: 'All-Range',
      optHeaders: false,
      outTable: Message('excel_table'),
    })
    .then('a10007', 'Robomotion.MicrosoftExcel.CloseExcel', 'Close Excel', {
      applicationId: Message('excel_app_id'),
    })
    .then('a10008', 'Core.Programming.Function', 'Stringify Table', {
      func: `var rows = (msg.excel_table && msg.excel_table.rows) || msg.excel_table || []; msg.excel_text = rows.map(function (row) { if (Array.isArray(row)) return row.join('\\t'); if (row && typeof row === 'object') return Object.keys(row).map(function (k) { return row[k]; }).join('\\t'); return String(row); }).join('\\n'); return msg;`,
    })
    .then('a10009', 'Core.Dialog.MessageBox', 'Show Table', {
      inTitle: Custom('Excel table values extracted:'),
      inText: Message('excel_text'),
      optType: 'info',
    });

  f.node('a10020', 'Core.Trigger.Catch', 'Catch Open Errors', {
    optNodes: { type: 'catch', all: false, ids: ['a10005'] },
  })
    .then('a10021', 'Core.Programming.Function', 'Check Retry', {
      outputs: 2,
      func: `if ((msg.retry_count || 0) < 1) { msg.retry_count = (msg.retry_count || 0) + 1; return [msg, null]; } return [null, msg];`,
    });

  f.node('a10022', 'Core.Programming.Sleep', 'Wait 2s', {
    optDuration: Custom(2),
  })
    .then('a10023', 'Core.Flow.GoTo', 'Retry', {
      optNodes: { type: 'goto', ids: ['a10011'], all: false },
    });

  f.node('a10098', 'Core.Flow.Stop', 'Stop Fail', { optSuccess: 'failed', optReason: Custom('Excel open failed after 1 retry') });
  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10010', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10009', 0, 'a10099', 0);
  f.edge('a10021', 0, 'a10022', 0);
  f.edge('a10021', 1, 'a10098', 0);
});

myFlow.start();
