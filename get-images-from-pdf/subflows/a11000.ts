import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Download Fixtures', (f) => {
  f.node('b11001', 'Core.Flow.Begin', 'Begin', {})
    .then('b11002', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/get-images-from-pdf/fixtures';
msg._dl_dir = fixtures;
msg._dl_with_images_pdf = fixtures + '/with_images.pdf';
return msg;`,
    })
    .then('b11003', 'Core.FileSystem.Create', 'Create Fixtures Dir', {
      inPath: Message('_dl_dir'),
      optType: 'directory',
      outPath: Message('_dl_created_dir'),
      continueOnError: true,
    })
    .then('b11004', 'Core.Net.Download', 'Download with_images.pdf', {
      inUrl: Custom('https://public-files.robomotion.io/templates/pdf-automation/get-images-from-pdf/fixtures/with_images.pdf'),
      inPath: Message('_dl_with_images_pdf'),
      outPath: Message('_dl_path'),
      optTimeout: 60,
    })
    .then('b11099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
