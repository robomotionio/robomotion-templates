import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('220659bb-c450-4654-af7b-ded057ed7c3b', 'Imported Convert Datetime to Text', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Convert Datetime to Text\n\nConverts a datetime value into a formatted text string using the Robomotion DateTime package. Demonstrates standard and custom output layouts for logging, filenames, and reports.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Robomotion.DateTime.Now', 'Get Now', {
      optLayout: 'RFC3339',
      optTimezoneOffset: 'Local',
      outNow: Message('current_date_time'),
    })
    .then('a10010', 'Robomotion.DateTime.Format', 'Format Short Date', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('1/2/2006'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('a10011', 'Core.Programming.Function', 'Build Short Date Text', {
      func: `msg.dialog_text = "Current date in 'short date' text format:\\n" + msg.formatted_date_time;
return msg;`,
    })
    .then('a10012', 'Core.Dialog.MessageBox', 'Show Short Date', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10020', 'Robomotion.DateTime.Format', 'Format Short Time', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('3:04 PM'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('a10021', 'Core.Programming.Function', 'Build Short Time Text', {
      func: `msg.dialog_text = "Current time in 'short time' text format:\\n" + msg.formatted_date_time;
return msg;`,
    })
    .then('a10022', 'Core.Dialog.MessageBox', 'Show Short Time', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10030', 'Robomotion.DateTime.Format', 'Format Long Date', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('January 02, 2006'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('a10031', 'Core.Programming.Function', 'Build Long Date Text', {
      func: `msg.dialog_text = "Current date in 'MMMM dd, yyyy' text format:\\n" + msg.formatted_date_time;
return msg;`,
    })
    .then('a10032', 'Core.Dialog.MessageBox', 'Show Long Date', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10040', 'Robomotion.DateTime.Format', 'Format Today Sentence', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('Today is 02th day of January of Year 2006'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('a10042', 'Core.Dialog.MessageBox', 'Show Today Sentence', {
      inTitle: Custom('Result'),
      inText: Message('formatted_date_time'),
      optType: 'info',
    })
    .then('a10050', 'Robomotion.DateTime.Format', 'Format 12-Hour Time', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('03:04:05 PM'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('a10051', 'Core.Programming.Function', 'Build 12-Hour Time Text', {
      func: `msg.dialog_text = "Current time in 'hh:mm:ss tt' text format:\\n" + msg.formatted_date_time;
return msg;`,
    })
    .then('a10052', 'Core.Dialog.MessageBox', 'Show 12-Hour Time', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10060', 'Robomotion.DateTime.Format', 'Format Time Sentence', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('It is currently 03 hours 04 minutes and 05 seconds.'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('a10062', 'Core.Dialog.MessageBox', 'Show Time Sentence', {
      inTitle: Custom('Result'),
      inText: Message('formatted_date_time'),
      optType: 'info',
    })
    .then('a10070', 'Robomotion.DateTime.Format', 'Format Full DateTime', {
      inTime: Message('current_date_time'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('Monday, 02 January, 2006 | 03:04:05 PM'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('a10071', 'Core.Programming.Function', 'Build Full DateTime Text', {
      func: `msg.dialog_text = "Today's date and time is " + msg.formatted_date_time;
return msg;`,
    })
    .then('a10072', 'Core.Dialog.MessageBox', 'Show Full DateTime', {
      inTitle: Custom('Result'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
