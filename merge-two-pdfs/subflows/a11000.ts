import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/merge-two-pdfs/fixtures';
msg._dl_dir = fixtures;
msg._dl_first_three_pdf = fixtures + '/first_three.pdf';
msg._dl_last_two_pdf = fixtures + '/last_two.pdf';
return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download first_three.pdf', {
      inUrl: Custom('https://public-files.robomotion.io/templates/pdf-automation/merge-two-pdfs/fixtures/first_three.pdf'),
      inPath: Message('_dl_first_three_pdf'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11005', 'Core.Net.Download', 'Download last_two.pdf', {
      inUrl: Custom('https://public-files.robomotion.io/templates/pdf-automation/merge-two-pdfs/fixtures/last_two.pdf'),
      inPath: Message('_dl_last_two_pdf'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
