import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('04ffb135-bfcb-48a0-b14c-c58ea797d3e1', 'Imported Run an Application', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Run an Application\n\nStarts a desktop application by executable path — the simplest form of process orchestration in Robomotion.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Build Desktop Path', {
      func: `msg.desktop_folder_path = global.get('$Home$') + '\\\\Desktop'; return msg;`,
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask App Path', {
      inTitle: Custom('Run an application'),
      inText: Custom('Select the app you would like to run..'),
      optDefault: Custom('notepad.exe'),
      outText: Message('selected_file'),
    })
    .then('a10004', 'Core.Process.StartProcess', 'Run App', {
      inFilePath: Message('selected_file'),
      optBackground: true,
      outPid: Message('app_process_id'),
      continueOnError: true,
    })
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
