import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('fd197349-8ff0-4205-b6c5-ae440d8ea644', 'Imported Extract Phone Numbers and Emails', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Extract Phone Numbers and Emails\n\nScans free-form text with regular expressions and pulls out every phone number and email address. Foundation for contact-harvesting jobs.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Dialog.InputBox', 'Ask For Text', {
      inTitle: Custom('Recognize & extract all phone numbers and emails from text'),
      inText: Custom('Please provide a text:'),
      optDefault: Custom(
        'You have received a new request from a customer email: john@contoso.com and phone number: (123)456-7890'
      ),
      outText: Message('input_text'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return msg.input_text ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.Programming.Function', 'Extract Entities', {
    func: `var emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g; var phoneRe = /\\+?\\d[\\d\\s().-]{7,}\\d/g; msg.recognized_emails = msg.input_text.match(emailRe) || []; msg.recognized_phone_numbers = msg.input_text.match(phoneRe) || []; if (!msg.recognized_phone_numbers.length) msg.recognized_phone_numbers = ['No phone number found in the given text. ']; if (!msg.recognized_emails.length) msg.recognized_emails = ['No email found in the given text. ']; return msg;`,
  })
    .then('a10005', 'Core.Programming.Function', 'Build Results Text', {
      func: `msg.dialog_text = 'Recognized phone number(s):\\n' + msg.recognized_phone_numbers.join(', ') + '\\n\\nRecognized email(s):\\n' + msg.recognized_emails.join(', '); return msg;`,
    })
    .then('a10006', 'Core.Dialog.MessageBox', 'Show Results', {
      inTitle: Custom('Flow ran succesfully...'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10006', 0, 'a10099', 0);
});

myFlow.start();
