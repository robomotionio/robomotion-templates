import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('d416e729-6381-4dee-93f3-e37b50341ffb', 'Imported Write To Clipboard', (f) => {
  f.node('0751e4', 'Core.Flow.Comment', 'Comment', { optText: '# Write To Clipboard How-To\n\nThis template receives a message from the user and copies it to the clipboard.\n\n## Usage Steps\n\n### 1. Run the Flow\n\nSimply execute the flow. The template will prompt you for input and then copy your message to the clipboard.\n\n## Result\n\nWhen the flow is executed, the template will receive your message and automatically copy it to your clipboard, making it ready to paste anywhere you need.' });
  f.node('73c2ee', 'Core.Trigger.Inject', 'Start', {})
    .then('dfb885', 'Core.Dialog.InputBox', 'Get Clipboard Data', { inTitle: Custom('Type Something For Copying To Clipboard') })
    .then('bd7585', 'Core.Clipboard.Set', 'Copy To Clipboard', {})
    .then('0eab2c', 'Core.Programming.Function', 'Prepare Message', { func: 'msg.message = "Just send ctlr + v short cut to anywhere to see clipboard content";\nreturn msg;' })
    .then('ea24b5', 'Core.Dialog.MessageBox', 'Show Message', { inTitle: Custom('Your Message Copied To Clipboard'), inText: Message('message') })
    .then('8b7dc4', 'Core.Flow.Stop', 'Stop', {});
}).start();