import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('6204fa75-f522-416a-a565-b4c06fbd9c2b', 'Imported Merge Two PDFs', (f) => {
  f.addDependency('Robomotion.PDFProcessor', '0.1.5');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Merge Two PDFs\n\nJoins two PDF files into a single output document — the minimal merge recipe.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10002', 'Core.Programming.Function', 'Build Defaults', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/merge-two-pdfs/fixtures'; msg.fixtures_dir = fixtures; msg.default_first = fixtures + '/first_three.pdf'; msg.default_second = fixtures + '/last_two.pdf'; msg.default_dest = fixtures + '/output'; return msg;`,
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask First PDF', {
      inTitle: Custom(' Merge two PDFs into one.'),
      inText: Custom('Select the first PDF file:'),
      optDefault: Message('default_first'),
      outText: Message('first_doc'),
    })
    .then('a10004', 'Core.Dialog.InputBox', 'Ask Second PDF', {
      inTitle: Custom(' Merge two PDFs into one.'),
      inText: Custom('Select the second PDF file:'),
      optDefault: Message('default_second'),
      outText: Message('second_doc'),
    })
    .then('a10005', 'Core.Dialog.InputBox', 'Ask Destination', {
      inTitle: Custom(' Merge two PDFs into one.'),
      inText: Custom('Select a folder to save the merged PDF file...'),
      optDefault: Message('default_dest'),
      outText: Message('destination_folder'),
    })
    .then('a10006', 'Core.Programming.Function', 'Validate Inputs', {
      outputs: 2,
      func: `if (!msg.first_doc || !msg.second_doc || !msg.destination_folder) return [null, msg]; msg.pdf_paths = [msg.second_doc, msg.first_doc]; msg.suffix_base = 'MergedFile'; msg.suffix_ext = '.pdf'; msg.suffix_idx = 0; msg.candidate_path = msg.destination_folder + '\\\\' + msg.suffix_base + msg.suffix_ext; return [msg, null];`,
    });

  f.node('a10007', 'Core.FileSystem.Create', 'Create Dest Dir', {
    inPath: Message('destination_folder'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10009', 'Core.Flow.GoTo', 'Enter Suffix Loop', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10010', 'Core.Flow.Label', 'Suffix Loop', {})
    .then('a10011', 'Core.FileSystem.PathExists', 'Check Candidate', {
      inPath: Message('candidate_path'),
      outResult: Message('candidate_exists'),
    })
    .then('a10012', 'Core.Programming.Function', 'Next Or Done', {
      outputs: 2,
      func: `if (msg.candidate_exists) { msg.suffix_idx += 1; msg.candidate_path = msg.destination_folder + '\\\\' + msg.suffix_base + '_' + (msg.suffix_idx + 1) + msg.suffix_ext; return [msg, null]; } msg.merged_path = msg.candidate_path; return [null, msg];`,
    });

  f.node('a10013', 'Core.Flow.GoTo', 'Loop Back', {
    optNodes: { type: 'goto', ids: ['a10010'], all: false },
  });

  f.node('a10014', 'Robomotion.PDFProcessor.Core.Merge', 'Merge PDFs', {
    inCustomPDFPaths: Message('pdf_paths'),
    inPDFPathSave: Message('merged_path'),
  })
    .then('a10015', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The merged file has been saved in: ' + msg.merged_path; return msg;`,
    })
    .then('a10016', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Done!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10006', 0, 'a10007', 0);
  f.edge('a10006', 1, 'a10099', 0);
  f.edge('a10012', 0, 'a10013', 0);
  f.edge('a10012', 1, 'a10014', 0);
  f.edge('a10016', 0, 'a10099', 0);
});

myFlow.start();
