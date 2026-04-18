import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('d6ffdf7e-2a44-408b-a784-5de7c89fc7f7', 'Imported Search and Replace Excel Values', (f) => {
  f.addDependency('Robomotion.MicrosoftExcel', '1.10.2');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Search and Replace Excel Values\n\nPerforms a find-and-replace across an Excel worksheet and saves the result. Handy for bulk corrections or masking sensitive fields.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Default Path', {
      func: `var fixtures = global.get('$Home$') + '/templates/excel-automation/search-and-replace-excel-values/fixtures';
msg.fixtures_dir = fixtures;
msg.sample_xlsx = fixtures + '/sample.xlsx';
return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask Find Text', {
      inTitle: Custom('Search and replace Excel values'),
      inText: Custom('Text to find:'),
      optDefault: Custom('Istanbul'),
      outText: Message('text_to_find'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask New Text', {
      inTitle: Custom('Search and replace Excel values'),
      inText: Custom('Text to replace with:'),
      optDefault: Custom('Izmir'),
      outText: Message('new_text'),
    })
    .then('a10004', 'Core.Dialog.InputBox', 'Ask Excel File', {
      inTitle: Custom('Search and replace Excel values'),
      inText: Custom('Please select the Excel file (*.xls,*.xlsx,*.csv) you want to search text in:'),
      optDefault: Message('sample_xlsx'),
      outText: Message('selected_file'),
    })
    .then('a10005', 'Core.Dialog.InputBox', 'Ask Mode', {
      inTitle: Custom('Search and replace Excel values'),
      inText: Custom('Type "all" to replace every match or "first" to replace only the first:'),
      optDefault: Custom('all'),
      outText: Message('rename_function'),
    })
    .then('a10006', 'Core.Programming.Function', 'Validate', {
      outputs: 2,
      func: `if (!msg.text_to_find || !msg.selected_file || !/\\.(xls\\w*|csv)$/i.test(msg.selected_file)) return [null, msg];
msg.rename_function = (msg.rename_function || 'all').trim().toLowerCase() === 'first' ? 'first' : 'all';
return [msg, null];`,
    });

  f.node('a10007', 'Robomotion.MicrosoftExcel.OpenExcel', 'Open Excel', {
    path: Message('selected_file'),
    optVisible: true,
    outApplicationId: Message('excel_app_id'),
  })
    .then('a10008', 'Robomotion.MicrosoftExcel.SearchSheet', 'Search', {
      applicationId: Message('excel_app_id'),
      searchTerm: Message('text_to_find'),
      sheetSelection: 'Active-Sheet',
      foundCells: Message('found_cells'),
    })
    .then('a10009', 'Core.Programming.Function', 'Pick Cells To Replace', {
      func: `var cells = msg.found_cells || [];
msg.cells_to_replace = (msg.rename_function === 'first') ? cells.slice(0, 1) : cells;
return msg;`,
    })
    .then('a10010', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10020'], all: false },
    });

  f.node('a10020', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10021', 'Core.Programming.ForEach', 'For Each Match', {
      optInput: Message('cells_to_replace'),
      optOutput: Message('current_cell'),
    });

  f.node('a10022', 'Core.Programming.Function', 'Extract Cell Address', {
    func: `var c = msg.current_cell;
if (typeof c === 'string') { msg.cell_address = c; } else if (c && c.address) { msg.cell_address = c.address; } else if (c && c.Cell) { msg.cell_address = c.Cell; } else if (c && typeof c.column === 'number' && typeof c.row === 'number') { var col = String.fromCharCode(64 + c.column);
msg.cell_address = col + c.row; } else { msg.cell_address = ''; } return msg;`,
  })
    .then('a10023', 'Robomotion.MicrosoftExcel.SetCellValue', 'Replace Value', {
      applicationId: Message('excel_app_id'),
      cell: Message('cell_address'),
      value: Message('new_text'),
      mod1: 'string',
      continueOnError: true,
    })
    .then('a10024', 'Core.Flow.GoTo', 'Loop Back', {
      optNodes: { type: 'goto', ids: ['a10020'], all: false },
    });

  f.node('a10030', 'Robomotion.MicrosoftExcel.SaveExcel', 'Save Workbook', {
    applicationId: Message('excel_app_id'),
  })
    .then('a10031', 'Robomotion.MicrosoftExcel.CloseExcel', 'Close Excel', {
      applicationId: Message('excel_app_id'),
    })
    .then('a10032', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Done!'),
      inText: Custom('Find-and-replace complete.'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10006', 0, 'a10007', 0);
  f.edge('a10006', 1, 'a10099', 0);
  f.edge('a10021', 0, 'a10022', 0);
  f.edge('a10021', 1, 'a10030', 0);
  f.edge('a10032', 0, 'a10099', 0);
});

myFlow.start();
