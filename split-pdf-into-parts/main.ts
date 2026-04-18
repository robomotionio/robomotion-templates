import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('d96f25dd-50c0-4d51-a885-fbc3b8977c1d', 'Imported Split PDF into Parts', (f) => {
  f.addDependency('Robomotion.PDFBox', '2.0.24');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Split PDF into Parts\n\nDivides a PDF into N equal-sized slices and writes each part out as its own file. A general-purpose chunker for large documents.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10040', 'Core.Programming.Function', 'Build Default', {
      func: `msg.default_pdf = global.get('$Home$') + '/templates/pdf-automation/split-pdf-into-parts/fixtures/sample.pdf';
return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PDF', {
      inTitle: Custom('Split a PDF file'),
      inText: Custom('Select a PDF file to split:'),
      optDefault: Message('default_pdf'),
      outText: Message('pdf_path'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask N', {
      inTitle: Custom('Split a PDF file'),
      inText: Custom('Specify the number of pages to split by:'),
      optDefault: Custom('3'),
      outText: Message('n_text'),
    })
    .then('a10004', 'Core.Programming.Function', 'Validate', {
      outputs: 2,
      func: `var n = Number(msg.n_text);
if (!msg.pdf_path || !/\\.pdf$/i.test(msg.pdf_path) || !Number.isInteger(n) || n < 1) return [null, msg];
msg.pages_per_part = n;
var p = msg.pdf_path;
var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\'));
msg.directory = p.substring(0, lastSlash);
var stamp = Date.now();
msg.pages_dir = msg.directory + '/_pages_' + stamp;
msg.split_output_dir = msg.directory + '/parts_' + stamp;
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
    .then('a10008', 'Core.Programming.Function', 'Build Chunks', {
      func: `var list = (msg.page_files || []).filter(function (x) { return !x.IsDir; });
list.sort(function (a, b) { return a.Name < b.Name ? -1 : (a.Name > b.Name ? 1 : 0); });
var paths = list.map(function (x) { return x.Name; });
var n = Number(msg.pages_per_part);
var chunks = [];
for (var i = 0; i < paths.length; i += n) chunks.push(paths.slice(i, i + n));
msg.chunks = chunks;
return msg;`,
    })
    .then('a10009', 'Core.FileSystem.Create', 'Ensure Output Dir', {
      inPath: Message('split_output_dir'),
      optType: 'directory',
      continueOnError: true,
    })
    .then('a10010', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10020'], all: false },
    });

  f.node('a10020', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10021', 'Core.Programming.ForEach', 'For Each Chunk', {
      optInput: Message('chunks'),
      optOutput: Message('current_chunk'),
      optIndex: Message('current_index'),
    });

  f.node('a10050', 'Core.Flow.SubFlow', 'Merge Chunk', {})
    .then('a10022', 'Core.Flow.GoTo', 'Loop Back', {
      optNodes: { type: 'goto', ids: ['a10020'], all: false },
    });

  f.node('a10030', 'Core.FileSystem.Delete', 'Cleanup Pages Dir', {
    inPath: Message('pages_dir'),
    continueOnError: true,
  })
    .then('a10031', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The output PDF files are located in:\\n' + msg.split_output_dir;
return msg;`,
    })
    .then('a10032', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Flow ran successfully!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10021', 0, 'a10050', 0);
  f.edge('a10021', 1, 'a10030', 0);
  f.edge('a10032', 0, 'a10099', 0);
});

myFlow.start();
