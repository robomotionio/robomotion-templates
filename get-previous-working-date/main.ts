import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('1e63fc61-ecc8-40f3-9dee-e58a51d9debb', 'Imported Get Previous Working Date', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get Previous Working Date\n\nWalks backwards from today to find the previous working day, handling weekends through conditional logic. A building block for backdated reports or audits.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Robomotion.DateTime.Now', 'Get Today', {
      optLayout: 'RFC3339',
      optTimezoneOffset: 'Local',
      outNow: Message('today'),
    })
    .then('a10003', 'Robomotion.DateTime.Split', 'Split Today', {
      inTime: Message('today'),
      optLayout: 'RFC3339',
      outParts: Message('today_parts'),
    })
    .then('a10004', 'Core.Programming.Function', 'Compute Day Offset', {
      func: `var w = msg.today_parts.weekday; msg.day_offset = (w === 'Sunday' || w === 0) ? -2 : (w === 'Monday' || w === 1) ? -3 : -1; return msg;`,
    })
    .then('a10005', 'Robomotion.DateTime.Add', 'Previous Working Day', {
      inTime: Message('today'),
      inDuration: Message('day_offset'),
      optDurationUnit: 'Days',
      optLayout: 'RFC3339',
      outTimeResult: Message('previous_working_day'),
    })
    .then('a10006', 'Robomotion.DateTime.Split', 'Split Previous', {
      inTime: Message('previous_working_day'),
      optLayout: 'RFC3339',
      outParts: Message('previous_parts'),
    })
    .then('a10007', 'Robomotion.DateTime.Format', 'Format Month Name', {
      inTime: Message('previous_working_day'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('January'),
      outFormattedTime: Message('month_name'),
    })
    .then('a10008', 'Core.Programming.Function', 'Build Dialog Text', {
      func: `msg.dialog_text = 'The last working day was:\\n\\nDay: ' + msg.previous_parts.day + '\\nMonth: ' + msg.month_name + '\\nYear: ' + msg.previous_parts.year; return msg;`,
    })
    .then('a10009', 'Core.Dialog.MessageBox', 'Show Result', {
      inTitle: Custom(' '),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10010', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
