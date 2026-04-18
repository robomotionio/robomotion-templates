import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('File Exists', (f) => {
  f.node('b10001', 'Core.Flow.Begin', 'Begin', {})
    .then('b10002', 'Core.Programming.Function', 'Build Found Text', {
      func: `msg.dialog_text = "Filename: '" + msg.user_input + "' exists in your desktop folder.";
return msg;`,
    })
    .then('b10003', 'Core.Dialog.MessageBox', 'Show Found', {
      inTitle: Custom('File found!'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('b10004', 'Core.Flow.End', 'End', { sfPort: 0 });
});
