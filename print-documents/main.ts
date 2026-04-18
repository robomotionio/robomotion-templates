import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('3de32a36-de6a-41a0-97f8-75192297d291', 'Imported Print Documents', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Print Documents\n\nIterates a folder of documents and sends each one to the default printer. A compact recipe for automating bulk print jobs.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Seed Fixtures Dir', {
      func: `var fixtures = global.get('$Home$') + '/templates/desktop-automation/print-documents/fixtures'; msg.fixtures_dir = fixtures; return msg;`,
    })
    .then('a10002', 'Core.Dialog.MessageBox', 'Intro', {
      inTitle: Custom('Print documents'),
      inText: Custom(
        'This desktop flow prompts you to select files through a dialog box and prints them using the default printer.'
      ),
      optType: 'info',
    })
    .then('a10003', 'Core.Programming.Function', 'Seed File List', {
      func: `msg.files_to_print = [msg.fixtures_dir + '/hello.txt']; return msg;`,
    })
    .then('a10004', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10010', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10011', 'Core.Programming.ForEach', 'For Each File', {
      optInput: Message('files_to_print'),
      optOutput: Message('file_to_print'),
    });

  f.node('a10012', 'Core.Programming.Function', 'Build Print Command', {
    func: `msg.print_args = ['-NoProfile', '-Command', 'Start-Process -FilePath ' + JSON.stringify(msg.file_to_print) + ' -Verb Print']; return msg;`,
  })
    .then('a10013', 'Core.Process.StartProcess', 'Send To Printer', {
      inFilePath: Custom('powershell'),
      inArguments: Message('print_args'),
      optBackground: true,
      continueOnError: true,
    })
    .then('a10014', 'Core.Flow.GoTo', 'Loop Back', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10011', 0, 'a10012', 0);
  f.edge('a10011', 1, 'a10099', 0);
});

myFlow.start();
