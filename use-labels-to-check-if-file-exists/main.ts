import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('7449d9f1-2aa8-4091-bcf3-84fdad6670b0', 'Imported Use Labels to Check if File Exists', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Use Labels to Check if File Exists\n\nUses Label and GoTo to structure a loop that rechecks file existence — a non-sequential flow pattern useful for polling.' });

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

  f.node('a10007', 'Core.Flow.GoTo', 'Jump To Exists', {
    optNodes: { type: 'goto', ids: ['a10020'], all: false },
  });

  f.node('a10008', 'Core.Flow.GoTo', 'Jump To Missing', {
    optNodes: { type: 'goto', ids: ['a10030'], all: false },
  });

  f.node('a10020', 'Core.Flow.Label', 'File_Exists', {})
    .then('a10021', 'Core.Programming.Function', 'Build Found Text', {
      func: `msg.dialog_text = "Filename: '" + msg.user_input + "' exists in your desktop folder."; return msg;`,
    })
    .then('a10022', 'Core.Dialog.MessageBox', 'Show Found', {
      inTitle: Custom('File found!'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10023', 'Core.Flow.Stop', 'Stop After Found', {});

  f.node('a10030', 'Core.Flow.Label', 'File_Does_Not_Exist', {})
    .then('a10031', 'Core.Programming.Function', 'Build Missing Text', {
      func: `msg.dialog_text = "Filename: '" + msg.user_input + "' doesn't exist in your desktop folder."; return msg;`,
    })
    .then('a10032', 'Core.Dialog.MessageBox', 'Show Missing', {
      inTitle: Custom('File not found!'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10033', 'Core.Flow.Stop', 'Stop After Missing', {});

  f.node('a10099', 'Core.Flow.Stop', 'Stop On Cancel', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10006', 0, 'a10007', 0);
  f.edge('a10006', 1, 'a10008', 0);
});

myFlow.start();
