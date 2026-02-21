import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('c5a571ab-78f2-4549-afac-9cc95a7dc097', 'Imported Read From Clipboard', (f) => {
  f.node('2872b3', 'Core.Flow.Comment', 'Comment', { optText: '# Write To Clipboard How-To\n\nThis template reads the current clipboard content and displays it in a message box.\n\n## Usage Steps\n\n### 1. Copy Text and Run the Flow\n\nCopy any text value to your clipboard, then execute the flow. The template will read the clipboard content and display it in a message box.\n\n## Result\n\nWhen the flow is executed, the template will capture whatever text is currently stored in your clipboard and show it to you in a message box.' });
  f.node('256899', 'Core.Trigger.Inject', 'Start', {})
    .then('4c92e1', 'Core.Clipboard.Get', 'Get From Clipboard', {})
    .then('a46179', 'Core.Programming.Function', 'Prepare Message', { func: 'msg.message = "Your clipboard content is: " + msg.text;\nreturn msg;' })
    .then('e65e7c', 'Core.Dialog.MessageBox', 'Show Message', { inTitle: Custom('Succesfully Read From Clipboard'), inText: Message('message') });
  f.node('da66e6', 'Core.Trigger.Catch', 'Catch', { optNodes: { type: 'catch', ids: ['4c92e1'], all: false } })
    .then('9e15c8', 'Core.Dialog.MessageBox', 'Show Error Message', { inTitle: Custom('Error Occured When Reading From Clipboard'), inText: Custom('It seems that the content of clipboard is not text. Plesae copy some text and re-run the flow') });
  f.node('233152', 'Core.Flow.Stop', 'Stop', {});

  f.edge('e65e7c', 0, '233152', 0);
  f.edge('9e15c8', 0, '233152', 0);
}).start();