import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('7b17397d-8ab0-4eaf-8792-adb3e49b24af', 'Imported Sort Lines of a Text File', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Sort Lines of a Text File\n\nReads a text file, sorts its lines alphabetically, and writes the result back out. Reusable for cleaning up exports and datasets.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Default Path', {
      func: `var fixtures = global.get('$Home$') + '/templates/text-manipulation/sort-lines-of-text-file/fixtures'; msg.fixture_path = fixtures + '/unsorted.txt'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.MessageBox', 'Show Description', {
      inTitle: Custom('Description'),
      inText: Custom(
        'This flow prompts you to select a text file. Then, it reads its contents, sorts the lines alphabetically, and saves them into a new text file.'
      ),
      optType: 'info',
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Select Text File', {
      inTitle: Custom('Please select a text file to sort...'),
      inText: Custom('Enter the path to a .txt file (OK to continue, Cancel to skip):'),
      optDefault: Message('fixture_path'),
      outText: Message('selected_text_file'),
    })
    .then('a10004', 'Core.Programming.Function', 'Branch On Selection', {
      outputs: 2,
      func: `var p = (msg.selected_text_file || '').trim(); return (p && /\\.txt$/i.test(p)) ? [msg, null] : [null, msg];`,
    });

  f.node('a10005', 'Core.FileSystem.ReadFile', 'Read File', {
    inPath: Message('selected_text_file'),
    optBase64: false,
    outContent: Message('file_contents_raw'),
  })
    .then('a10006', 'Core.Programming.Function', 'Sort Lines', {
      func: `var lf = String.fromCharCode(10); var lines = msg.file_contents_raw.split(lf); if (lines.length && lines[lines.length - 1] === '') lines.pop(); lines.sort(function (a, b) { return a.localeCompare(b); }); msg.sorted_text = lines.join(lf) + lf; return msg;`,
    })
    .then('a10007', 'Core.Programming.Function', 'Build Sorted Path', {
      func: `var p = msg.selected_text_file; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); var dir = p.substring(0, lastSlash); var base = p.substring(lastSlash + 1); var dot = base.lastIndexOf('.'); var stem = dot === -1 ? base : base.substring(0, dot); var ext = dot === -1 ? '' : base.substring(dot); msg.sorted_file_path = dir + '\\\\' + stem + '_Sorted' + ext; return msg;`,
    })
    .then('a10008', 'Core.FileSystem.WriteFile', 'Write Sorted File', {
      inPath: Message('sorted_file_path'),
      inText: Message('sorted_text'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10009', 'Core.Programming.Function', 'Build Results Text', {
      func: `msg.dialog_text = 'The contents of the file:\\n\\n' + msg.selected_text_file + '\\n\\nhave been sorted and saved in:\\n\\n' + msg.sorted_file_path; return msg;`,
    })
    .then('a10010', 'Core.Dialog.MessageBox', 'Show Results', {
      inTitle: Custom('Flow completed!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Dialog.MessageBox', 'Show Completion', {
    inTitle: Custom('Example completed!'),
    inText: Custom("Example 'Sort lines of a text file' has been completed."),
    optType: 'info',
  }).then('a10100', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10010', 0, 'a10099', 0);
});

myFlow.start();
