import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Get Excel Files Details', (f) => {
  f.node('b10001', 'Core.Flow.Begin', 'Begin', {})
    .then('b10002', 'Core.Dialog.InputBox', 'Ask Recipient', {
      inTitle: Custom('Consolidate data from different Excel spreadsheets into one.'),
      inText: Custom('Please enter the email address to send the final report to:'),
      optDefault: Custom('finance@contoso.com'),
      outText: Message('recipient_email'),
    })
    .then('b10003', 'Core.Programming.Function', 'Seed File List', {
      func: `var fixtures = msg.fixtures_dir || (global.get('$Home$') + '/templates/excel-automation/consolidate-excel-reports/fixtures'); msg.file_list = [fixtures + '/report_q1.csv', fixtures + '/report_q2.csv', fixtures + '/report_q3.csv']; return msg;`,
    })
    .then('b10004', 'Core.Flow.End', 'End', { sfPort: 0 });
});
