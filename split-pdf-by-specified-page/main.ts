import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('6474eb64-a9c9-4919-8ff2-a3de299ec8a9', 'Imported Split PDF by Specified Page', (f) => {
  f.addDependency('Robomotion.PDFBox', '2.0.24');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Split PDF by Specified Page\n\nSplits a PDF into two files at a user-specified page number. Ideal when you know exactly where a document should be divided.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10020', 'Core.Programming.Function', 'Build Default', {
      func: `msg.default_pdf = global.get('$Home$') + '/templates/pdf-automation/split-pdf-by-specified-page/fixtures/sample.pdf';
return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PDF', {
      inTitle: Custom('Split a PDF into two parts'),
      inText: Custom('Select a PDF file to split:'),
      optDefault: Message('default_pdf'),
      outText: Message('pdf_path'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Split Page', {
      inTitle: Custom('Split a PDF into two parts'),
      inText: Custom('Split at page number:'),
      optDefault: Custom('3'),
      outText: Message('split_at_text'),
    })
    .then('a10004', 'Core.Programming.Function', 'Validate Inputs', {
      outputs: 2,
      func: `var n = Number(msg.split_at_text);
if (!msg.pdf_path || !/\\.pdf$/i.test(msg.pdf_path) || !Number.isInteger(n) || n < 1) return [null, msg];
msg.split_at_page = n;
var p = msg.pdf_path;
var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\'));
msg.directory = p.substring(0, lastSlash);
var base = p.substring(lastSlash + 1);
var dot = base.lastIndexOf('.');
msg.stem = dot === -1 ? base : base.substring(0, dot);
var stamp = Date.now();
msg.pages_dir = msg.directory + '/_pages_' + stamp;
msg.split_output_dir = msg.directory + '/split_parts_' + stamp;
return [msg, null];`,
    });

  f.node('a10005', 'Core.FileSystem.Create', 'Ensure Pages Dir', {
    inPath: Message('pages_dir'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10006', 'Robomotion.PDFBox.Split', 'Split Per Page', {
      inPath: Message('pdf_path'),
      outDir: Message('pages_dir'),
      optPrefix: Custom('p'),
      optPerPage: 1,
    })
    .then('a10007', 'Core.FileSystem.List', 'List Pages', {
      inDirPath: Message('pages_dir'),
      optAbsolutePath: true,
      optIsDir: true,
      optTop: 0,
      optSort: 'ascend',
      outFiles: Message('page_files'),
    })
    .then('a10008', 'Core.Programming.Function', 'Plan Halves', {
      outputs: 2,
      func: `var list = (msg.page_files || []).filter(function (x) { return !x.IsDir; });
list.sort(function (a, b) { return a.Name < b.Name ? -1 : (a.Name > b.Name ? 1 : 0); });
var c = list.length;
var n = Number(msg.split_at_page);
if (!c || c < 2 || n < 1 || n >= c) return [null, msg];
msg.page_count = c;
msg.first_paths = list.slice(0, n).map(function (x) { return x.Name; });
msg.second_paths = list.slice(n).map(function (x) { return x.Name; });
msg.first_out = msg.split_output_dir + '/' + msg.stem + '-1.pdf';
msg.second_out = msg.split_output_dir + '/' + msg.stem + '-2.pdf';
return [msg, null];`,
    });

  f.node('a10009', 'Core.FileSystem.Create', 'Ensure Split Dir', {
    inPath: Message('split_output_dir'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10010', 'Robomotion.PDFBox.Merge', 'Build First Half', {
      inPaths: Message('first_paths'),
      outPath: Message('first_out'),
    })
    .then('a10011', 'Robomotion.PDFBox.Merge', 'Build Second Half', {
      inPaths: Message('second_paths'),
      outPath: Message('second_out'),
    })
    .then('a10012', 'Core.FileSystem.Delete', 'Cleanup Pages Dir', {
      inPath: Message('pages_dir'),
      continueOnError: true,
    })
    .then('a10013', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The output PDF files have been saved in:\\n' + msg.split_output_dir;
return msg;`,
    })
    .then('a10014', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Flow has been completed!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10008', 0, 'a10009', 0);
  f.edge('a10008', 1, 'a10099', 0);
  f.edge('a10014', 0, 'a10099', 0);
});

myFlow.start();
