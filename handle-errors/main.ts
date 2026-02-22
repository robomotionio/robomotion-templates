import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('a9ecc5cb-45f9-46a7-ab52-03e04ad9333b', 'Imported Handle Errors', (f) => {
  f.node('f0c384', 'Core.Flow.Comment', 'Comment', { optText: '##### Handle Errors\n\nThis template shows how to throw errors, and handle them\n\nYou can run the flow directly. \n\n\nIt expects a number which is larger than100 from user. If the input is not a number throws *InvlidType* error; if the number is not greater than 100, throws *InvalidNumber* error, and forces users to enter valid number' });
  f.node('c3ab59', 'Core.Trigger.Inject', 'Start', {});
  f.node('b4fe64', 'Core.Trigger.Catch', 'Catch Errors', { optNodes: { all: false, ids: ['3cb6d6'] } })
    .then('a60435', 'Core.Programming.Switch', 'What is the error type?', { optConditions: ['msg.error.message === "InvalidType"', 'msg.error.message === "InvalidNumber"'] })
    .then('c37bbe', 'Core.Dialog.MessageBox', 'Show "InvalidType" Error', { inText: Custom('You entered a value which is not a number'), inTitle: Custom('Invalid Type') });
  f.node('0e328a', 'Core.Flow.Label', 'Retry', {});
  f.node('eb47da', 'Core.Dialog.InputBox', 'Get Number', {
    inText: Custom('Enter a number which is larger than 100'),
    inTitle: Custom('Enter Number'),
    outText: Message('number')
  })
    .then('3cb6d6', 'Core.Programming.Function', 'Is Number Valid?', { func: 'if(isNaN(msg.number)){ // User enters an input which is not number\n  throw "InvalidType"\n}\nif(msg.number <= 100){\n  throw "InvalidNumber"\n  \n}\n\nreturn msg;' })
    .then('a169cf', 'Core.Dialog.MessageBox', 'Show Succeed', { inText: Custom('You entered valid number'), inTitle: Custom('Succeed') })
    .then('4133e5', 'Core.Flow.Stop', 'Stop', {});
  f.node('5f52fd', 'Core.Dialog.MessageBox', 'Show "InvalidNumber" Error', { inText: Custom('You entered a number which is not greater than 100'), inTitle: Custom('Invalid Number') });
  f.node('080519', 'Core.Flow.GoTo', 'Go To Retry', { optNodes: { all: false, ids: ['0e328a'] } });

  f.edge('c3ab59', 0, 'eb47da', 0);
  f.edge('0e328a', 0, 'eb47da', 0);
  f.edge('a60435', 1, '5f52fd', 0);
  f.edge('c37bbe', 0, '080519', 0);
  f.edge('5f52fd', 0, '080519', 0);
}).start();