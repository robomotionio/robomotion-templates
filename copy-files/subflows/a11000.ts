import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/desktop-automation/copy-files/fixtures';
msg._dl_dir = fixtures;
msg._dl_source_a_txt = fixtures + '/source_a.txt';
msg._dl_source_b_txt = fixtures + '/source_b.txt';
return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download source_a.txt', {
      inUrl: Custom('https://public-files.robomotion.io/templates/desktop-automation/copy-files/fixtures/source_a.txt'),
      inPath: Message('_dl_source_a_txt'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11005', 'Core.Net.Download', 'Download source_b.txt', {
      inUrl: Custom('https://public-files.robomotion.io/templates/desktop-automation/copy-files/fixtures/source_b.txt'),
      inPath: Message('_dl_source_b_txt'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
