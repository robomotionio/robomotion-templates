import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('200f475c-9ece-4120-8df2-235489362bbc', 'Imported Create PDF from Selected Pages', (f) => {
  f.addDependency('Robomotion.PDFBox', '2.0.24');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Create PDF from Selected Pages\n\nPulls a chosen range of pages from a source PDF and writes them to a new document. Useful for trimming or sharing parts of a report.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10020', 'Core.Programming.Function', 'Build Defaults', {
      func: `var fixtures = global.get('$Home$') + '/templates/pdf-automation/create-pdf-from-selected-pages/fixtures'; msg.default_pdf = fixtures + '/sample.pdf'; msg.default_dest = fixtures + '/output'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PDF', {
      inTitle: Custom('Create new PDF from selected PDF pages'),
      inText: Custom('Select the PDF to extract pages from:'),
      optDefault: Message('default_pdf'),
      outText: Message('pdf_path'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Pages', {
      inTitle: Custom('Create new PDF from selected PDF pages'),
      inText: Custom('Page number(s) e.g. 1,3,5-7:'),
      optDefault: Custom('1,3,5-7'),
      outText: Message('pages_text'),
    })
    .then('a10004', 'Core.Dialog.InputBox', 'Ask Destination', {
      inTitle: Custom('Create new PDF from selected PDF pages'),
      inText: Custom('Select a folder to save the new PDF file...'),
      optDefault: Message('default_dest'),
      outText: Message('destination_folder'),
    })
    .then('a10005', 'Core.Programming.Function', 'Validate And Parse', {
      outputs: 2,
      func: `if (!msg.pdf_path || !/\\.pdf$/i.test(msg.pdf_path) || !msg.destination_folder) return [null, msg]; var pageSet = []; var groups = String(msg.pages_text || '').split(','); for (var i = 0; i < groups.length; i++) { var g = groups[i].trim(); if (!g) continue; var m = g.match(/^(\\d+)-(\\d+)$/); if (m) { var a = Number(m[1]), b = Number(m[2]); for (var j = a; j <= b; j++) pageSet.push(j); } else if (/^\\d+$/.test(g)) { pageSet.push(Number(g)); } } pageSet = pageSet.filter(function (x, idx, arr) { return arr.indexOf(x) === idx; }); pageSet.sort(function (a, b) { return a - b; }); if (!pageSet.length) return [null, msg]; msg.selected_pages = pageSet; var p = msg.pdf_path; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); msg.pages_dir = p.substring(0, lastSlash) + '/_pages'; msg.suffix_base = 'NewPDFfile'; msg.suffix_ext = '.pdf'; msg.suffix_idx = 0; msg.candidate_path = msg.destination_folder + '/' + msg.suffix_base + msg.suffix_ext; return [msg, null];`,
    });

  f.node('a10006', 'Core.FileSystem.Create', 'Ensure Dest Dir', {
    inPath: Message('destination_folder'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10007', 'Core.FileSystem.Delete', 'Clear Pages Dir', {
      inPath: Message('pages_dir'),
      continueOnError: true,
    })
    .then('a10015', 'Core.FileSystem.Create', 'Ensure Pages Dir', {
      inPath: Message('pages_dir'),
      optType: 'directory',
      continueOnError: true,
    })
    .then('a10008', 'Robomotion.PDFBox.Split', 'Split Per Page', {
      inPath: Message('pdf_path'),
      outDir: Message('pages_dir'),
      optPrefix: Custom('p'),
      optPerPage: 1,
    })
    .then('a10009', 'Core.FileSystem.List', 'List Pages', {
      inDirPath: Message('pages_dir'),
      optAbsolutePath: true,
      optIsDir: true,
      optTop: 0,
      optSort: 'ascend',
      outFiles: Message('page_files'),
    })
    .then('a10010', 'Core.Programming.Function', 'Pick Selected Paths', {
      outputs: 2,
      func: `var list = (msg.page_files || []).filter(function (x) { return !x.IsDir; }); list.sort(function (a, b) { return a.Name < b.Name ? -1 : (a.Name > b.Name ? 1 : 0); }); var paths = list.map(function (x) { return x.Name; }); var picked = []; for (var i = 0; i < msg.selected_pages.length; i++) { var n = msg.selected_pages[i]; if (n >= 1 && n <= paths.length) picked.push(paths[n - 1]); } if (!picked.length) return [null, msg]; msg.picked_paths = picked; return [msg, null];`,
    })
    .then('a10030', 'Core.Flow.GoTo', 'Enter Suffix Loop', {
      optNodes: { type: 'goto', ids: ['a10031'], all: false },
    });

  f.node('a10031', 'Core.Flow.Label', 'Suffix Loop', {})
    .then('a10032', 'Core.FileSystem.PathExists', 'Check Candidate', {
      inPath: Message('candidate_path'),
      outResult: Message('candidate_exists'),
    })
    .then('a10033', 'Core.Programming.Function', 'Next Or Done', {
      outputs: 2,
      func: `if (msg.candidate_exists) { msg.suffix_idx += 1; msg.candidate_path = msg.destination_folder + '/' + msg.suffix_base + '_' + (msg.suffix_idx + 1) + msg.suffix_ext; return [msg, null]; } msg.output_path = msg.candidate_path; return [null, msg];`,
    });

  f.node('a10034', 'Core.Flow.GoTo', 'Loop Back', {
    optNodes: { type: 'goto', ids: ['a10031'], all: false },
  });

  f.node('a10011', 'Robomotion.PDFBox.Merge', 'Merge Selected', {
    inPaths: Message('picked_paths'),
    outPath: Message('output_path'),
  })
    .then('a10012', 'Core.FileSystem.Delete', 'Cleanup Pages Dir', {
      inPath: Message('pages_dir'),
      continueOnError: true,
    })
    .then('a10013', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The new file has been saved in: ' + msg.output_path; return msg;`,
    })
    .then('a10014', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Done!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10005', 0, 'a10006', 0);
  f.edge('a10005', 1, 'a10099', 0);
  f.edge('a10010', 0, 'a10030', 0);
  f.edge('a10010', 1, 'a10099', 0);
  f.edge('a10033', 0, 'a10034', 0);
  f.edge('a10033', 1, 'a10011', 0);
  f.edge('a10014', 0, 'a10099', 0);
});

myFlow.start();
