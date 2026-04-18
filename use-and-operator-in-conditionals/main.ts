import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('2077b07b-5e22-433b-97dc-1df0970dc29e', 'Imported Use the AND Operator in Conditionals', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Use the AND Operator in Conditionals\n\nShows how to branch a flow only when two conditions are both true using a Switch node with a combined predicate.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Seed Inputs', {
      func: `msg.tool = 'Robomotion'; msg.company = 'Robomotion Inc.'; return msg;`,
    })
    .then('a10003', 'Core.Programming.Function', 'AND Test', {
      outputs: 2,
      func: `return (msg.tool === 'Robomotion' && msg.company === 'Robomotion Inc.') ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.Dialog.MessageBox', 'Show Success', {
    inTitle: Custom('Flow ran successfully!'),
    inText: Custom('All the provided conditions were true.'),
    optType: 'info',
  });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10004', 0, 'a10099', 0);
});

myFlow.start();
