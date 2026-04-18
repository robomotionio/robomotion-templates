import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('e0cde9e6-363b-4cdd-a6f1-312fced760be', 'Imported Split PDF by Half', (f) => {
  f.addDependency('Robomotion.PDFBox', '2.0.24');
  f.addDependency('Robomotion.PDFProcessor', '0.1.5');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Split PDF by Half\n\nCalculates a midpoint and splits a PDF into two evenly-sized halves. Demonstrates arithmetic on page counts feeding a splitter.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10022', 'Core.Programming.Function', 'Build Default', {
      func: `msg.default_pdf = global.get('$Home$') + '/templates/pdf-automation/split-pdf-by-half/fixtures/sample.pdf'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PDF', {
      inTitle: Custom('Split a PDF by half'),
      inText: Custom('Select a PDF file to split:'),
      optDefault: Message('default_pdf'),
      outText: Message('pdf_path'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return (msg.pdf_path && /\\.pdf$/i.test(msg.pdf_path)) ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.Programming.Function', 'Derive Paths', {
    func: `var p = msg.pdf_path; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); msg.directory = p.substring(0, lastSlash); msg.split_output_dir = msg.directory + '/split_halves_' + Date.now(); return msg;`,
  })
    .then('a10020', 'Core.Flow.SubFlow', 'Get Page Count', {})
    .then('a10021', 'Core.Flow.SubFlow', 'Compute Half', {})
    .then('a10005', 'Core.Programming.Function', 'Plan Split', {
      outputs: 2,
      func: `var c = Number(msg.page_count); if (!c || c < 2) return [null, msg]; msg.custom_pages = [msg.half + 1]; return [msg, null];`,
    });

  f.node('a10006', 'Core.FileSystem.Create', 'Ensure Split Dir', {
    inPath: Message('split_output_dir'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10007', 'Robomotion.PDFProcessor.Core.Split', 'Split At Midpoint', {
      inPDFPath: Message('pdf_path'),
      inDir: Message('split_output_dir'),
      optCustomPages: Message('custom_pages'),
    })
    .then('a10008', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The output PDF files have been saved in:\\n' + msg.split_output_dir; return msg;`,
    })
    .then('a10009', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Flow has been completed!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10005', 0, 'a10006', 0);
  f.edge('a10005', 1, 'a10099', 0);
  f.edge('a10009', 0, 'a10099', 0);
});

myFlow.start();
