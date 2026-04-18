import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('9c1b90e6-2b25-4775-ace0-8f37ebb86e64', 'Imported Display JavaScript Output', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Display JavaScript Output\n\nExecutes an inline JavaScript snippet and surfaces its return value in a dialog. Demonstrates the JavaScript Run node.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Process.StartProcess', 'Run Node Script', {
      inFilePath: Custom('node'),
      inCustomArgs: ['-e', 'var variableName = "Hello World!"; console.log(variableName);'],
      optBackground: false,
      outStdout: Message('javascript_output'),
    })
    .then('a10003', 'Core.Programming.Function', 'Trim Output', {
      func: `var s = String(msg.javascript_output || ''); while (s.length && (s.charCodeAt(s.length - 1) === 10 || s.charCodeAt(s.length - 1) === 13)) s = s.slice(0, -1); msg.javascript_output = s; return msg;`,
    })
    .then('a10004', 'Core.Dialog.MessageBox', 'Show Output', {
      inTitle: Custom('Output from JavaScript:'),
      inText: Message('javascript_output'),
      optType: 'info',
    })
    .then('a10005', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
