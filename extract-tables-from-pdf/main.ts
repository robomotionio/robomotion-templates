import { flow, Message, Custom } from '@robomotion/sdk';

const psScript = [
  'param([string]$JsonPath, [string]$XlsxPath)',
  '$ErrorActionPreference = "Stop"',
  '$tables = Get-Content -Raw -LiteralPath $JsonPath | ConvertFrom-Json',
  '$excel = New-Object -ComObject Excel.Application',
  '$excel.Visible = $false',
  '$excel.DisplayAlerts = $false',
  '$wb = $excel.Workbooks.Add()',
  'while ($wb.Sheets.Count -lt $tables.Count) {',
  '  $wb.Sheets.Add([System.Reflection.Missing]::Value, $wb.Sheets.Item($wb.Sheets.Count)) | Out-Null',
  '}',
  'for ($i = 0; $i -lt $tables.Count; $i++) {',
  '  $table = $tables[$i]',
  '  $sheet = $wb.Sheets.Item($i + 1)',
  '  $sheet.Name = "Table_" + ($i + 1)',
  '  $cols = @($table.columns)',
  '  for ($c = 0; $c -lt $cols.Count; $c++) {',
  '    $sheet.Cells.Item(1, $c + 1) = $cols[$c]',
  '  }',
  '  $rows = @($table.rows)',
  '  for ($r = 0; $r -lt $rows.Count; $r++) {',
  '    $row = $rows[$r]',
  '    for ($c = 0; $c -lt $cols.Count; $c++) {',
  '      $sheet.Cells.Item($r + 2, $c + 1) = $row.($cols[$c])',
  '    }',
  '  }',
  '}',
  '$wb.SaveAs($XlsxPath, 51)',
  '$wb.Close($false)',
  '$excel.Quit()',
  '[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null',
].join('\r\n');

const myFlow = flow.create('e9375004-4206-4251-b855-d97fbb09c729', 'Imported Extract Tables from PDF', (f) => {
  f.addDependency('Robomotion.Pandas', '0.4.2');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Extract Tables from PDF\n\nLocates tables inside a PDF and extracts their rows into structured data. A drop-in stage in any OCR-adjacent pipeline.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/extract-tables-from-pdf/fixtures'; msg.fixtures_dir = fixtures; msg.sample_pdf = fixtures + '/tables.pdf'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PDF', {
      inTitle: Custom('Extract PDF tables to Excel'),
      inText: Custom('Select the PDF to extract table(s) from:'),
      optDefault: Message('sample_pdf'),
      outText: Message('pdf_path'),
    })
    .then('a10003', 'Core.Programming.Function', 'Validate', {
      outputs: 2,
      func: `if (!msg.pdf_path || !/\\.pdf$/i.test(msg.pdf_path)) return [null, msg]; var p = msg.pdf_path; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); var dir = p.substring(0, lastSlash); var stem = p.substring(lastSlash + 1).replace(/\\.pdf$/i, ''); msg.xlsx_path = dir + '/' + stem + '_tables.xlsx'; var stamp = Date.now(); msg.tables_json_path = dir + '/_tables_' + stamp + '.json'; msg.ps_script_path = dir + '/_write_xlsx_' + stamp + '.ps1'; return [msg, null];`,
    });

  f.node('a10004', 'Robomotion.Pandas.PdfToDataTable', 'Extract Tables', {
    inPath: Message('pdf_path'),
    optPages: Custom('all'),
    optTableSettings: 'lines',
    outTable: Message('table_list'),
  })
    .then('a10005', 'Core.Programming.Function', 'Serialize Tables JSON', {
      func: `msg.tables_json = JSON.stringify(msg.table_list || []); msg.ps_script = ${JSON.stringify(psScript)}; return msg;`,
    })
    .then('a10006', 'Core.FileSystem.WriteFile', 'Write Tables JSON', {
      inPath: Message('tables_json_path'),
      inText: Message('tables_json'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10007', 'Core.FileSystem.WriteFile', 'Write PowerShell Script', {
      inPath: Message('ps_script_path'),
      inText: Message('ps_script'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10008', 'Core.Programming.Function', 'Build PS Args', {
      func: `msg.ps_args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', msg.ps_script_path, '-JsonPath', msg.tables_json_path, '-XlsxPath', msg.xlsx_path]; return msg;`,
    })
    .then('a10009', 'Core.Process.StartProcess', 'Run PowerShell', {
      inFilePath: Custom('powershell'),
      inArguments: Message('ps_args'),
      optBackground: false,
    })
    .then('a10010', 'Core.FileSystem.Delete', 'Cleanup JSON', {
      inPath: Message('tables_json_path'),
      continueOnError: true,
    })
    .then('a10011', 'Core.FileSystem.Delete', 'Cleanup Script', {
      inPath: Message('ps_script_path'),
      continueOnError: true,
    })
    .then('a10012', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'Extracted tables saved in: ' + msg.xlsx_path; return msg;`,
    })
    .then('a10013', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Done!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10013', 0, 'a10099', 0);
});

myFlow.start();
