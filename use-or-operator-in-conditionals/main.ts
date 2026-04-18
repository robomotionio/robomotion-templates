import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('12ed202a-d649-4f9d-bbe9-60e3000d2b65', 'Imported Use the OR Operator in Conditionals', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Use the OR Operator in Conditionals\n\nCombines two conditions with a logical OR and branches the flow based on the result. Complements the AND-operator variant.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Seed Inputs', {
      func: `msg.tool = 'Robomotion';
msg.company = 'Some Other Corp';
return msg;`,
    })
    .then('a10003', 'Core.Programming.Function', 'OR Test', {
      outputs: 2,
      func: `return (msg.tool === 'Robomotion' || msg.company === 'Robomotion Inc.') ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.Dialog.MessageBox', 'Show Success', {
    inTitle: Custom('Flow ran successfully!'),
    inText: Custom('At least one of the provided conditions was true.'),
    optType: 'info',
  });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10004', 0, 'a10099', 0);
});

myFlow.start();
