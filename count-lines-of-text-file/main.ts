import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('681e3719-b6fc-4a07-bc58-050b30229b0b', 'Imported Count Lines of a Text File', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Count Lines of a Text File\n\nOpens a text file and reports the number of lines it contains. A tiny helper you can drop into larger analytics flows.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Default Path', {
      func: `var fixtures = global.get('$Home$') + '/templates/text-manipulation/count-lines-of-text-file/fixtures';
msg.fixture_path = fixtures + '/sample.txt';
return msg;`,
    })
    .then('a10002', 'Core.Dialog.MessageBox', 'Show Description', {
      inTitle: Custom('Description'),
      inText: Custom(
        'This flow prompts you to select a text file and displays the number of lines of its text content.'
      ),
      optType: 'info',
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Select Text File', {
      inTitle: Custom('Please select a text file...'),
      inText: Custom('Enter the path to a .txt file (OK to continue, Cancel to skip):'),
      optDefault: Message('fixture_path'),
      outText: Message('selected_text_file'),
    })
    .then('a10004', 'Core.Programming.Function', 'Branch On Selection', {
      outputs: 2,
      func: `var p = (msg.selected_text_file || '').trim();
return (p && /\\.txt$/i.test(p)) ? [msg, null] : [null, msg];`,
    });

  f.node('a10005', 'Core.FileSystem.ReadFile', 'Read File', {
    inPath: Message('selected_text_file'),
    optBase64: false,
    outContent: Message('file_contents'),
  })
    .then('a10006', 'Core.Programming.Function', 'Count Lines', {
      func: `var lf = String.fromCharCode(10);
var lines = msg.file_contents.split(lf);
if (lines.length && lines[lines.length - 1] === '') lines.pop();
msg.line_count = lines.length;
msg.dialog_text = 'The file has ' + msg.line_count + ' lines!';
return msg;`,
    })
    .then('a10007', 'Core.Dialog.MessageBox', 'Show Line Count', {
      inTitle: Custom('Results...'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Dialog.MessageBox', 'Show Completion', {
    inTitle: Custom('Example completed!'),
    inText: Custom("Example 'Count lines of text file' has been completed."),
    optType: 'info',
  }).then('a10100', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10007', 0, 'a10099', 0);
});

myFlow.start();
