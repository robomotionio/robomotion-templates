import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/text-manipulation/count-lines-of-text-file/fixtures'; msg._dl_dir = fixtures; msg._dl_sample_txt = fixtures + '/sample.txt'; return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download sample.txt', {
      inUrl: Custom('https://public-files.robomotion.io/templates/text-manipulation/count-lines-of-text-file/fixtures/sample.txt'),
      inPath: Message('_dl_sample_txt'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
