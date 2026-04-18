import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/desktop-automation/share-powerpoint-file-as-pdf/fixtures';
msg._dl_dir = fixtures;
msg._dl_deck_pptx = fixtures + '/deck.pptx';
return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download deck.pptx', {
      inUrl: Custom('https://public-files.robomotion.io/templates/desktop-automation/share-powerpoint-file-as-pdf/fixtures/deck.pptx'),
      inPath: Message('_dl_deck_pptx'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
