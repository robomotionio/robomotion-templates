import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('91118709-f8ed-48ed-a134-27b76c421d46', 'Imported Get Number of Pages in a PDF', (f) => {
  f.addDependency('Robomotion.PDFBox', '2.0.24');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get Number of Pages in a PDF\n\nReports the page count of a PDF file as a single number. A small utility that feeds splitters, paginators, and dashboards.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10020', 'Core.Programming.Function', 'Build Default', {
      func: `msg.default_pdf = global.get('$Home$') + '/templates/pdf-automation/get-number-of-pages/fixtures/sample.pdf'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PDF Path', {
      inTitle: Custom('Find the number of pages in PDF'),
      inText: Custom('Select a PDF file:'),
      optDefault: Message('default_pdf'),
      outText: Message('pdf_path'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return (msg.pdf_path && /\\.pdf$/i.test(msg.pdf_path)) ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.Programming.Function', 'Build Temp Dir', {
    func: `var p = msg.pdf_path; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); msg.count_dir = p.substring(0, lastSlash) + '\\\\_page_count'; return msg;`,
  })
    .then('a10021', 'Core.FileSystem.Delete', 'Clear Temp Dir', {
      inPath: Message('count_dir'),
      continueOnError: true,
    })
    .then('a10005', 'Core.FileSystem.Create', 'Ensure Temp Dir', {
      inPath: Message('count_dir'),
      optType: 'directory',
      continueOnError: true,
    })
    .then('a10006', 'Robomotion.PDFBox.Split', 'Split Per Page', {
      inPath: Message('pdf_path'),
      outDir: Message('count_dir'),
      optPrefix: Custom('p'),
      optPerPage: 1,
    })
    .then('a10007', 'Core.FileSystem.List', 'List Pieces', {
      inDirPath: Message('count_dir'),
      optAbsolutePath: true,
      optIsDir: true,
      optTop: 0,
      outFiles: Message('page_files'),
    })
    .then('a10008', 'Core.Programming.Function', 'Count And Clean', {
      func: `var list = msg.page_files || []; var pages = 0; for (var i = 0; i < list.length; i++) { if (!list[i].IsDir) pages++; } msg.page_count = pages || 0; msg.dialog_text = 'The selected PDF file has ' + msg.page_count + ' pages.'; return msg;`,
    })
    .then('a10009', 'Core.FileSystem.Delete', 'Remove Temp Dir', {
      inPath: Message('count_dir'),
      continueOnError: true,
    })
    .then('a10010', 'Core.Dialog.MessageBox', 'Show Count', {
      inTitle: Custom('Flow finished running...'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10010', 0, 'a10099', 0);
});

myFlow.start();
