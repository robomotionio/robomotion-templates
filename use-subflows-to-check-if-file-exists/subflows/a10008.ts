import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('File Does Not Exist', (f) => {
  f.node('c10001', 'Core.Flow.Begin', 'Begin', {})
    .then('c10002', 'Core.Programming.Function', 'Build Missing Text', {
      func: `msg.dialog_text = "Filename: '" + msg.user_input + "' doesn't exist in your desktop folder.";
return msg;`,
    })
    .then('c10003', 'Core.Dialog.MessageBox', 'Show Missing', {
      inTitle: Custom('File not found!'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('c10004', 'Core.Flow.End', 'End', { sfPort: 0 });
});
