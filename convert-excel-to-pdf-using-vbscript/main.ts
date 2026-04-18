import { flow, Message, Custom } from '@robomotion/sdk';

const scriptTemplate = [
  'Dim Excel',
  'Dim ExcelDoc',
  '',
  "'Opens the Excel file",
  'Set Excel = CreateObject("Excel.Application")',
  'Set ExcelDoc = Excel.Workbooks.Open(${EXCEL_PATH})',
  '',
  "'Creates the pdf file",
  'Excel.ActiveSheet.ExportAsFixedFormat 0, ${PDF_PATH}, 0, 1, 0, , , 0',
  '',
  "'Closes the Excel file",
  'Excel.ActiveWorkbook.Close',
  'Excel.Application.Quit',
].join('\n');

const myFlow = flow.create('70e36839-1f44-4792-ab5d-06e9c2612969', 'Imported Convert Excel to PDF Using VBScript', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Convert Excel to PDF Using VBScript\n\nRuns an inline VBScript that drives Excel COM to export a workbook as PDF. Shows how to bridge Robomotion with Windows scripting.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/scripting/convert-excel-to-pdf-using-vbscript/fixtures';
msg.fixtures_dir = fixtures;
msg.sample_xlsx = fixtures + '/sample.xlsx';
msg.output_dir = fixtures + '/output';
return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask Excel', {
      inTitle: Custom('Convert Excel to PDF'),
      inText: Custom('Select the Excel file you want to convert:'),
      optDefault: Message('sample_xlsx'),
      outText: Message('excel_path'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Destination', {
      inTitle: Custom('Convert Excel to PDF'),
      inText: Custom('Select a folder to save the new PDF file...'),
      optDefault: Message('output_dir'),
      outText: Message('destination_folder'),
    })
    .then('a10004', 'Core.Programming.Function', 'Validate', {
      outputs: 2,
      func: `if (!msg.excel_path || !/\\.xlsx?$/i.test(msg.excel_path) || !msg.destination_folder) return [null, msg];
msg.pdf_path = msg.destination_folder + '/ConvertedPDFfile.pdf';
msg.script_path = msg.destination_folder + '/_convert.vbs';
return [msg, null];`,
    });

  f.node('a10005', 'Core.FileSystem.Create', 'Ensure Dest Dir', {
    inPath: Message('destination_folder'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10006', 'Core.Programming.Function', 'Build Script', {
      func: `var tpl = ${JSON.stringify(scriptTemplate)};
msg.vbs_body = tpl.replace('\${EXCEL_PATH}', '"' + msg.excel_path.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '""') + '"').replace('\${PDF_PATH}', '"' + msg.pdf_path.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '""') + '"');
return msg;`,
    })
    .then('a10007', 'Core.FileSystem.WriteFile', 'Write VBS', {
      inPath: Message('script_path'),
      inText: Message('vbs_body'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10008', 'Core.Programming.Function', 'Build Args', {
      func: `msg.vbs_args = ['//Nologo', msg.script_path];
return msg;`,
    })
    .then('a10009', 'Core.Process.StartProcess', 'Run VBScript', {
      inFilePath: Custom('cscript'),
      inArguments: Message('vbs_args'),
      optBackground: false,
      outStdout: Message('vbs_output'),
    })
    .then('a10010', 'Core.FileSystem.Delete', 'Cleanup Script', {
      inPath: Message('script_path'),
      continueOnError: true,
    })
    .then('a10011', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The generated PDF file is stored at: ' + msg.pdf_path;
return msg;`,
    })
    .then('a10012', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('The flow ran successfully.'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10012', 0, 'a10099', 0);
});

myFlow.start();
