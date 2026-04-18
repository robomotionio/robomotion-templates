import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('5ab692b4-ce12-48ab-abab-f0176f5f874a', 'Imported Get Images from PDF', (f) => {
  f.addDependency('Robomotion.PDFBox', '2.0.24');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get Images from PDF\n\nExtracts every embedded image from a PDF file into a target directory. Useful for downstream OCR or asset recovery.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/get-images-from-pdf/fixtures';
msg.fixtures_dir = fixtures;
msg.source_pdf = fixtures + '/with_images.pdf';
msg.images_dir = fixtures + '/images';
return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PDF', {
      inTitle: Custom('Extract images from PDF'),
      inText: Custom('Select the PDF to extract image(s) from:'),
      optDefault: Message('source_pdf'),
      outText: Message('pdf_path'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Destination', {
      inTitle: Custom('Extract images from PDF'),
      inText: Custom('Select to folder to save the extracted images to...'),
      optDefault: Message('images_dir'),
      outText: Message('destination_folder'),
    })
    .then('a10004', 'Core.Programming.Function', 'Validate', {
      outputs: 2,
      func: `return (msg.pdf_path && /\\.pdf$/i.test(msg.pdf_path) && msg.destination_folder) ? [msg, null] : [null, msg];`,
    });

  f.node('a10005', 'Core.FileSystem.Create', 'Ensure Dest Dir', {
    inPath: Message('destination_folder'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10006', 'Robomotion.PDFBox.ExtractImages', 'Extract Images', {
      inPath: Message('pdf_path'),
      outDir: Message('destination_folder'),
      optExportType: 'png',
      optPrefix: Custom('PDF Image'),
    })
    .then('a10007', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Done!'),
      inText: Custom('Images extracted successfully.'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10007', 0, 'a10099', 0);
});

myFlow.start();
