import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('00869a9e-4673-4196-8e25-f65888447289', 'Imported Merge PDFs', (f) => {
  f.addDependency('Robomotion.PDFProcessor', '0.1.5');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Merge PDFs\n\nCombines every PDF in a folder into one consolidated document using a reusable merge subflow.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10002', 'Core.Programming.Function', 'Seed PDF List', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/merge-pdfs/fixtures'; msg.fixtures_dir = fixtures; msg.default_dest = fixtures + '/output'; msg.pdf_list = [fixtures + '/doc_a.pdf', fixtures + '/doc_b.pdf', fixtures + '/doc_c.pdf', fixtures + '/doc_d.pdf']; return msg;`,
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Destination', {
      inTitle: Custom(' Merge multiple PDFs into one'),
      inText: Custom('Select to folder to save the merged PDF file...'),
      optDefault: Message('default_dest'),
      outText: Message('destination_folder'),
    })
    .then('a10004', 'Core.Programming.Function', 'Reverse And Plan', {
      outputs: 2,
      func: `if (!msg.destination_folder) return [null, msg]; msg.pdf_list = msg.pdf_list.slice().reverse(); msg.suffix_base = 'MergedFile'; msg.suffix_ext = '.pdf'; msg.suffix_idx = 0; msg.candidate_path = msg.destination_folder + '/' + msg.suffix_base + msg.suffix_ext; return [msg, null];`,
    });

  f.node('a10005', 'Core.FileSystem.Create', 'Create Dest Dir', {
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
      func: `if (msg.candidate_exists) { msg.suffix_idx += 1; msg.candidate_path = msg.destination_folder + '/' + msg.suffix_base + '_' + (msg.suffix_idx + 1) + msg.suffix_ext; return [msg, null]; } msg.merged_path = msg.candidate_path; return [null, msg];`,
    });

  f.node('a10013', 'Core.Flow.GoTo', 'Loop Back', {
    optNodes: { type: 'goto', ids: ['a10010'], all: false },
  });

  f.node('a10006', 'Robomotion.PDFProcessor.Core.Merge', 'Merge PDFs', {
    inCustomPDFPaths: Message('pdf_list'),
    inPDFPathSave: Message('merged_path'),
  })
    .then('a10007', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The merged file has been saved in: ' + msg.merged_path; return msg;`,
    })
    .then('a10008', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Done!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10012', 0, 'a10013', 0);
  f.edge('a10012', 1, 'a10006', 0);
  f.edge('a10008', 0, 'a10099', 0);
});

myFlow.start();
