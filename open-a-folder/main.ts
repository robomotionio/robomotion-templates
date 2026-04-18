import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('024d427e-0ed0-441d-974a-c56ac07215ca', 'Imported Open a Folder', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Open a Folder\n\nLaunches the system file explorer pointed at a given path. Minimal template demonstrating the Application.Launch node.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Build Documents Path', {
      func: `var home = (typeof global !== 'undefined' && global.get) ? global.get('$Home$') : ''; msg.documents_folder_path = (home ? home : 'C:\\\\Users\\\\faik') + '\\\\Documents'; return msg;`,
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Folder', {
      inTitle: Custom('Open a folder'),
      inText: Custom('Select the folder to open...'),
      optDefault: Message('documents_folder_path'),
      outText: Message('selected_folder'),
    })
    .then('a10004', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return (msg.selected_folder && msg.selected_folder.trim()) ? [msg, null] : [null, msg];`,
    });

  f.node('a10005', 'Core.Programming.Function', 'Build Args', {
    func: `msg.explorer_args = [msg.selected_folder]; return msg;`,
  })
    .then('a10006', 'Core.Process.StartProcess', 'Launch Explorer', {
      inFilePath: Custom('explorer.exe'),
      inArguments: Message('explorer_args'),
      optBackground: true,
      outPid: Message('app_process_id'),
      continueOnError: true,
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10006', 0, 'a10099', 0);
});

myFlow.start();
