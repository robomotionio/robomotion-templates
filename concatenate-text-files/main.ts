import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('a07ddc8e-02f0-4a3e-814e-a452561fb758', 'Imported Concatenate Text Files', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Concatenate Text Files\n\nReads every .txt file in a directory and stitches their contents into a single output file. Useful for log rollups.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Paths', {
      func: `var fixtures = global.get('$Home$') + '/templates/text-manipulation/concatenate-text-files/fixtures'; msg.fixtures_dir = fixtures; msg.output_file_path = fixtures + '/ConcatenatedFiles.txt'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.MessageBox', 'Show Description', {
      inTitle: Custom('Description'),
      inText: Custom(
        "This flow prompts you to select multiple text files and concatenates their content into a single new file. You can select multiple files by holding down the 'Control' button."
      ),
      optType: 'info',
    })
    .then('a10003', 'Core.Programming.Function', 'Seed File List', {
      func: `msg.files_to_concatenate = [msg.fixtures_dir + '/part1.txt', msg.fixtures_dir + '/part2.txt']; return msg;`,
    })
    .then('a10004', 'Core.FileSystem.Delete', 'Clean Previous Output', {
      inPath: Message('output_file_path'),
      continueOnError: true,
    })
    .then('a10005', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10006'], all: false },
    });

  f.node('a10006', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10007', 'Core.Programming.ForEach', 'For Each File', {
      optInput: Message('files_to_concatenate'),
      optOutput: Message('current_file'),
      optIndex: Message('current_index'),
    });

  f.node('a10010', 'Core.FileSystem.ReadFile', 'Read Current File', {
    inPath: Message('current_file'),
    optBase64: false,
    outContent: Message('current_file_contents'),
  })
    .then('a10011', 'Core.Programming.Function', 'Build Output Path', {
      func: `var lastSlash = Math.max(msg.current_file.lastIndexOf('/'), msg.current_file.lastIndexOf('\\\\')); msg.output_path = msg.current_file.substring(0, lastSlash) + '\\\\ConcatenatedFiles.txt'; msg.line_to_write = msg.current_file_contents + '\\n'; return msg;`,
    })
    .then('a10012', 'Core.FileSystem.WriteFile', 'Append to Output', {
      inPath: Message('output_path'),
      inText: Message('line_to_write'),
      optBase64: false,
      optMode: 'append',
    })
    .then('a10013', 'Core.Flow.GoTo', 'Loop Back', {
      optNodes: { type: 'goto', ids: ['a10006'], all: false },
    });

  f.node('a10099', 'Core.Dialog.MessageBox', 'Show Completion', {
    inTitle: Custom('Example completed!'),
    inText: Custom("Example 'Concatenate text files' has been completed."),
    optType: 'info',
  }).then('a10100', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10007', 0, 'a10010', 0);
  f.edge('a10007', 1, 'a10099', 0);
});

myFlow.start();
