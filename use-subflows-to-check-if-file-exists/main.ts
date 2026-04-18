import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('a45b07c3-25ee-453c-9c35-3f54f6edcb21', 'Imported Use Subflows to Check if File Exists', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Use Subflows to Check if File Exists\n\nEncapsulates a "does this file exist?" check inside a reusable subflow so the main flow stays linear and readable.' });

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
    func: `var desktop = global.get('$Home$') + '/Desktop'; msg.candidate_path = desktop + '/' + msg.user_input; return msg;`,
  })
    .then('a10005', 'Core.FileSystem.PathExists', 'Path Exists?', {
      inPath: Message('candidate_path'),
      outResult: Message('exists'),
    })
    .then('a10006', 'Core.Programming.Function', 'Branch On Existence', {
      outputs: 2,
      func: `return msg.exists ? [msg, null] : [null, msg];`,
    });

  f.node('a10007', 'Core.Flow.SubFlow', 'Call File_Exists', {});

  f.node('a10008', 'Core.Flow.SubFlow', 'Call File_Does_Not_Exist', {});

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10006', 0, 'a10007', 0);
  f.edge('a10006', 1, 'a10008', 0);
  f.edge('a10007', 0, 'a10099', 0);
  f.edge('a10008', 0, 'a10099', 0);
});

myFlow.start();
