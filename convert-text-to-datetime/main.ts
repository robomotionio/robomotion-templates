import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('ccebdc1e-d95a-4467-976b-62ce4b47cfd2', 'Imported Convert Text to Datetime', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Convert Text to Datetime\n\nParses a text string like "2025-05-01 09:30:00" into a true datetime value the flow can work with. Shows how to declare an input layout so downstream nodes can format or compare the date.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10011', 'Robomotion.DateTime.Format', 'Parse Date', {
      inTime: Custom('20220101'),
      optInLayout: 'Custom',
      optCustomInLayout: Custom('20060102'),
      optOutLayout: 'RFC3339',
      outFormattedTime: Message('text_as_date_time'),
    })
    .then('a10012', 'Core.Programming.Function', 'Build Date Dialog Text', {
      func: `msg.dialog_text = "The text '20220101' has been converted to the following datetime variable: " + msg.text_as_date_time;
return msg;`,
    })
    .then('a10013', 'Core.Dialog.MessageBox', 'Show Date', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10021', 'Robomotion.DateTime.Format', 'Parse Time', {
      inTime: Custom('23:45:00'),
      optInLayout: 'Custom',
      optCustomInLayout: Custom('15:04:05'),
      optOutLayout: 'RFC3339',
      outFormattedTime: Message('text_as_date_time'),
    })
    .then('a10022', 'Core.Programming.Function', 'Build Time Dialog Text', {
      func: `msg.dialog_text = "The text '23:45:00' has been converted to the following datetime variable: " + msg.text_as_date_time;
return msg;`,
    })
    .then('a10023', 'Core.Dialog.MessageBox', 'Show Time', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10031', 'Robomotion.DateTime.Format', 'Parse DateTime', {
      inTime: Custom('January 01, 2022 23:45:00'),
      optInLayout: 'Custom',
      optCustomInLayout: Custom('January 02, 2006 15:04:05'),
      optOutLayout: 'RFC3339',
      outFormattedTime: Message('text_as_date_time'),
    })
    .then('a10032', 'Core.Programming.Function', 'Build DateTime Dialog Text', {
      func: `msg.dialog_text = "The text 'January 01, 2022 23:45:00' has been converted to the following datetime variable: " + msg.text_as_date_time;
return msg;`,
    })
    .then('a10033', 'Core.Dialog.MessageBox', 'Show DateTime', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
