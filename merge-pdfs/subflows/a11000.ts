import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/merge-pdfs/fixtures';
msg._dl_dir = fixtures;
msg._dl_doc_a_pdf = fixtures + '/doc_a.pdf';
msg._dl_doc_b_pdf = fixtures + '/doc_b.pdf';
msg._dl_doc_c_pdf = fixtures + '/doc_c.pdf';
msg._dl_doc_d_pdf = fixtures + '/doc_d.pdf';
return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download doc_a.pdf', {
      inUrl: Custom('https://public-files.robomotion.io/templates/pdf-automation/merge-pdfs/fixtures/doc_a.pdf'),
      inPath: Message('_dl_doc_a_pdf'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11005', 'Core.Net.Download', 'Download doc_b.pdf', {
      inUrl: Custom('https://public-files.robomotion.io/templates/pdf-automation/merge-pdfs/fixtures/doc_b.pdf'),
      inPath: Message('_dl_doc_b_pdf'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11006', 'Core.Net.Download', 'Download doc_c.pdf', {
      inUrl: Custom('https://public-files.robomotion.io/templates/pdf-automation/merge-pdfs/fixtures/doc_c.pdf'),
      inPath: Message('_dl_doc_c_pdf'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11007', 'Core.Net.Download', 'Download doc_d.pdf', {
      inUrl: Custom('https://public-files.robomotion.io/templates/pdf-automation/merge-pdfs/fixtures/doc_d.pdf'),
      inPath: Message('_dl_doc_d_pdf'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
