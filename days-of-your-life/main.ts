import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('2762c4f4-e834-4d3b-945c-60d907406d89', 'Imported Days of Your Life', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Days of Your Life\n\nCalculates how many days you have been alive by subtracting your birthday from today. Uses DateTime Now, Subtract, and a Function node to produce a clean day count.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Dialog.MessageBox', 'Show Description', {
      inTitle: Custom('Description'),
      inText: Custom(
        'This flow prompts you to enter your birth date. Then, it calculates and displays your age in days.'
      ),
      optType: 'info',
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Birth Date', {
      inTitle: Custom('Please select your birthday...'),
      inText: Custom('Select your birth date (YYYY-MM-DD):'),
      optDefault: Custom('1990-01-01'),
      outText: Message('birth_date_text'),
    })
    .then('a10004', 'Robomotion.DateTime.Format', 'Parse Birth Date', {
      inTime: Message('birth_date_text'),
      optInLayout: 'Custom',
      optCustomInLayout: Custom('2006-01-02'),
      optOutLayout: 'RFC3339',
      outFormattedTime: Message('birth_date'),
    })
    .then('a10005', 'Robomotion.DateTime.Now', 'Get Current Date', {
      optLayout: 'RFC3339',
      optTimezoneOffset: 'Local',
      outNow: Message('current_date'),
    })
    .then('a10006', 'Robomotion.DateTime.Span', 'Days Since Birth', {
      inStartDate: Message('birth_date'),
      inEndDate: Message('current_date'),
      optLayout: 'RFC3339',
      outSpan: Message('span_ms'),
    })
    .then('a10007', 'Core.Programming.Function', 'Milliseconds to Days', {
      func: `msg.days_alive = Math.floor(msg.span_ms / 86400000);
return msg;`,
    })
    .then('a10008', 'Core.Programming.Function', 'Build Dialog Text', {
      func: `msg.dialog_text = "Today is day #" + msg.days_alive + "\\n\\nEach day is unique. Make the most of it and don't forget to laugh!!!";
return msg;`,
    })
    .then('a10009', 'Core.Dialog.MessageBox', 'Show Age', {
      inTitle: Custom('Attention!'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10010', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
