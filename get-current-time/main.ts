import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('3095c176-9538-487a-92a4-94970eb8d1e5', 'Imported Get Current Time', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get Current Time\n\nReads the local date and time and formats it as a long time string (HH:mm:ss). Displays the result in an information dialog so you can verify the system clock at a glance.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Robomotion.DateTime.Now', 'Get Now', {
      optLayout: 'RFC3339',
      optTimezoneOffset: 'Local',
      outNow: Message('current_date_time'),
    })
    .then('a10003', 'Robomotion.DateTime.Format', 'Format Long Time', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('15:04:05'),
      outFormattedTime: Message('long_time'),
    })
    .then('a10004', 'Core.Programming.Function', 'Build Dialog Text', {
      func: `msg.dialog_text = 'It is ' + msg.long_time + ' currently.';
return msg;`,
    })
    .then('a10005', 'Core.Dialog.MessageBox', 'Show Information Dialog', {
      inTitle: Custom('Time right now'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10006', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
