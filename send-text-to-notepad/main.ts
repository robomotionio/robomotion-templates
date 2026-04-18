import { flow, Message, Custom } from '@robomotion/sdk';

const notepadText = [
  'Hello World!',
  "Quick reminder: don't forget to do that thing you said you'd do today.",
  'Or Robomotion can do that for you. :)',
].join('\n');

const myFlow = flow.create('911c07de-689e-4c3e-a378-c9f6b65818e7', 'Imported Send Text to Notepad', (f) => {
  f.addDependency('Robomotion.WindowsAutomation', '0.18.1');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Send Text to Notepad\n\nOpens Notepad and types a provided string into its editor window. Demonstrates how to pair Application.Launch with keyboard automation.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10003', 'Core.Process.StartProcess', 'Launch Notepad', {
      inFilePath: Custom('notepad.exe'),
      optBackground: true,
      outPid: Message('notepad_pid'),
    })
    .then('a10004', 'Robomotion.WindowsAutomation.WaitWindow', 'Wait For Notepad', {
      inSelector: Custom('//Window[contains(@Name,"Notepad")]'),
      optCondition: 'appear',
      optTimeout: 30,
    })
    .then('a10014', 'Robomotion.WindowsAutomation.SendKey', 'Maximize Notepad', {
      inSelector: Custom('//Window[contains(@Name,"Notepad")]'),
      optKeyModifier1: '{Win}',
      optText: Custom('{Up}'),
      optWaitTimeout: 10,
      continueOnError: true,
    })
    .then('a10005', 'Core.Programming.Function', 'Seed Text', {
      func: `msg.notepad_text = ${JSON.stringify(notepadText)}; return msg;`,
    })
    .then('a10006', 'Robomotion.WindowsAutomation.SetText', 'Populate Editor', {
      inSelector: Custom('//Window[contains(@Name,"Notepad")]//Edit'),
      inText: Message('notepad_text'),
      optClearFirst: true,
      optEmulateTyping: false,
      optWaitTimeout: 30,
    })
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
