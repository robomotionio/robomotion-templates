import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('35cba3e6-c333-42f1-86af-2092663a6f7c', 'Imported Use Conditionals to Check if File Exists', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Use Conditionals to Check if File Exists\n\nChecks whether a given file is present on disk and routes the flow accordingly. A textbook conditional branching example.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Dialog.InputBox', 'Ask For Filename', {
      inTitle: Custom('Check if file exists'),
      inText: Custom('Please populate a file name to check if it exists in your desktop folder.'),
      optDefault: Custom('FileName'),
      outText: Message('user_input'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return msg.user_input ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.Programming.Function', 'Build Desktop Path', {
    func: `var desktop = global.get('$Home$') + '\\\\Desktop'; msg.candidate_path = desktop + '\\\\' + msg.user_input; return msg;`,
  })
    .then('a10005', 'Core.FileSystem.PathExists', 'Path Exists?', {
      inPath: Message('candidate_path'),
      outResult: Message('exists'),
    })
    .then('a10006', 'Core.Programming.Function', 'Branch On Existence', {
      outputs: 2,
      func: `return msg.exists ? [msg, null] : [null, msg];`,
    });

  f.node('a10007', 'Core.Programming.Function', 'Build Found Text', {
    func: `msg.dialog_text = "Filename: '" + msg.user_input + "' exists in your desktop folder."; return msg;`,
  })
    .then('a10008', 'Core.Dialog.MessageBox', 'Show Found', {
      inTitle: Custom('File found!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10009', 'Core.Programming.Function', 'Build Missing Text', {
    func: `msg.dialog_text = "Filename: '" + msg.user_input + "' doesn't exist in your desktop folder."; return msg;`,
  })
    .then('a10010', 'Core.Dialog.MessageBox', 'Show Missing', {
      inTitle: Custom('File not found!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10006', 0, 'a10007', 0);
  f.edge('a10006', 1, 'a10009', 0);
  f.edge('a10008', 0, 'a10099', 0);
  f.edge('a10010', 0, 'a10099', 0);
});

myFlow.start();
