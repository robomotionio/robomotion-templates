import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('24dd9cda-446f-42e7-8729-3b9e0f3f2244', 'Imported Get First Working Day of the Next Month', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get First Working Day of the Next Month\n\nComputes the first business day of next month, skipping weekends. Useful for scheduling invoices, reports, or reminders that must fire on a working day.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Robomotion.DateTime.Now', 'Get Now', {
      optLayout: 'RFC3339',
      optTimezoneOffset: 'Local',
      outNow: Message('now'),
    })
    .then('a10003', 'Core.Programming.Function', 'Compute First Of Next Month', {
      func: `var d = new Date(msg.now); msg.first_day_of_next_month = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 1).toISOString(); return msg;`,
    })
    .then('a10004', 'Robomotion.DateTime.Split', 'Split First Day', {
      inTime: Message('first_day_of_next_month'),
      optLayout: 'RFC3339',
      outParts: Message('first_parts'),
    })
    .then('a10005', 'Core.Programming.Function', 'Branch Weekend vs Weekday', {
      outputs: 2,
      func: `msg.day_of_week = String(msg.first_parts.weekday); return msg.day_of_week.charAt(0).toUpperCase() === 'S' ? [msg, null] : [null, msg];`,
    });

  f.node('a10006', 'Core.Dialog.MessageBox', 'Show Weekend Result', {
    inTitle: Custom('Working Day'),
    inText: Custom('First working day of next month is Monday'),
    optType: 'info',
  })
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.node('a10007', 'Core.Programming.Function', 'Build Weekday Text', {
    func: `msg.dialog_text = 'First working day of next month is ' + msg.day_of_week; return msg;`,
  })
    .then('a10008', 'Core.Dialog.MessageBox', 'Show Weekday Result', {
      inTitle: Custom('Working day info'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.edge('a10005', 0, 'a10006', 0);
  f.edge('a10005', 1, 'a10007', 0);
  f.edge('a10008', 0, 'a10099', 0);
});

myFlow.start();
