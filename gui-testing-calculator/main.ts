import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('66f73520-18ba-4f07-910f-985ee80d343a', 'Imported GUI Testing Calculator', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');
  f.addDependency('Robomotion.WindowsAutomation', '0.18.1');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### GUI Testing Calculator\n\nDrives the Windows Calculator through native UI automation to validate arithmetic. A concrete template for end-to-end GUI testing of desktop apps.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10020', 'Core.Flow.SubFlow', 'Set Variables', {})
    .then('a10021', 'Core.Flow.SubFlow', 'Start Test Report', {})
    .then('a10022', 'Core.Flow.SubFlow', 'Launch App', {})
    .then('a10023', 'Core.Flow.SubFlow', 'Resize and Position App', {})
    .then('a10024', 'Core.Flow.SubFlow', 'Navigation Menu', {})
    .then('a10025', 'Core.Flow.SubFlow', 'Close App', {})
    .then('a10028', 'Core.Flow.SubFlow', 'Finish Test Report', {})
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.node('a10050', 'Core.Trigger.Catch', 'Catch Subflow Errors', {
    optNodes: { type: 'catch', all: false, ids: ['a10022', 'a10023', 'a10024', 'a10025'] },
  })
    .then('a10026', 'Core.Flow.SubFlow', 'Log Errors', {})
    .then('a10098', 'Core.Flow.Stop', 'Stop Fail', { optSuccess: 'failed', optReason: Custom('A subflow raised an error') });
});

myFlow.start();
