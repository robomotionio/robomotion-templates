import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('a183bd73-0e54-4c72-b689-716eb3835e15', 'Imported Display Python Output', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Display Python Output\n\nRuns an inline Python script and shows its output in a dialog. Demonstrates the Python Run node.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Process.StartProcess', 'Run Python Script', {
      inFilePath: Custom('python'),
      inCustomArgs: ['-c', 'variableName = "Hello World!"\nprint(variableName)'],
      optBackground: false,
      outStdout: Message('python_output'),
    })
    .then('a10003', 'Core.Programming.Function', 'Trim Output', {
      func: `var s = String(msg.python_output || ''); while (s.length && (s.charCodeAt(s.length - 1) === 10 || s.charCodeAt(s.length - 1) === 13)) s = s.slice(0, -1); msg.python_output = s; return msg;`,
    })
    .then('a10004', 'Core.Dialog.MessageBox', 'Show Output', {
      inTitle: Custom('Output from Python script:'),
      inText: Message('python_output'),
      optType: 'info',
    })
    .then('a10005', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
