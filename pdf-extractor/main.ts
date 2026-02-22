import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('ddcd307b-8f89-4fd5-95af-164b58aacd29', 'Pdf Extractor', (f) => {
  f.node('12b04f', 'Core.Flow.Comment', 'Comment', {
    optText: '\n# Pdf Extractor\nReads text from a pdf document.\n\n## How it Works?\n\n1. Go to Flow Designer and press package icon above the node palette.\n\n2. You should see PDFBox package icon, install it.\n\n3. Set the PDF File Path Input of the Extract Text node to the path of pdf document that you want to read.'
  });
  f.node('f07e63', 'Core.Trigger.Inject', 'Inject', {})
    .then('adbc50', 'Robomotion.PDFBox.ExtractText', 'Extract Text', {
    inPath: Custom('C:/Users/user/Desktop/sample.pdf'),
    outText: Message('text')
  })
    .then('6699e1', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
}).start();
