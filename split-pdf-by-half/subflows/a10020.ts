import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Get Page Count', (f) => {
  f.node('b10001', 'Core.Flow.Begin', 'Begin', {})
    .then('b10002', 'Core.Programming.Function', 'Build Count Dir', {
      func: `msg.count_dir = msg.directory + '/_page_count';
return msg;`,
    })
    .then('b10003', 'Core.FileSystem.Create', 'Ensure Count Dir', {
      inPath: Message('count_dir'),
      optType: 'directory',
      continueOnError: true,
    })
    .then('b10004', 'Robomotion.PDFBox.Split', 'Split Per Page', {
      inPath: Message('pdf_path'),
      outDir: Message('count_dir'),
      optPrefix: Custom('p'),
      optPerPage: 1,
    })
    .then('b10005', 'Core.FileSystem.List', 'List Pieces', {
      inDirPath: Message('count_dir'),
      optAbsolutePath: true,
      optIsDir: true,
      optTop: 0,
      outFiles: Message('count_files'),
    })
    .then('b10006', 'Core.Programming.Function', 'Count And Cleanup', {
      func: `var list = msg.count_files || [];
var pages = 0;
for (var i = 0; i < list.length; i++) { if (!list[i].IsDir) pages++; } msg.page_count = pages || 1;
return msg;`,
    })
    .then('b10007', 'Core.FileSystem.Delete', 'Cleanup Count Dir', {
      inPath: Message('count_dir'),
      continueOnError: true,
    })
    .then('b10008', 'Core.Flow.End', 'End', { sfPort: 0 });
});
