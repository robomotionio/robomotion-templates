import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Add Coins?', (f) => {
  f.node('fd18f0', 'Core.Flow.Begin', 'Begin', {})
    .then('e6d13d', 'Core.Programming.Function', 'Get Message', {
    func: 'msg.message = `You have ${msg.coin} coin(s). Do you want to add some more?`;\nreturn msg;'
  })
    .then('dd6e46', 'Core.Dialog.MessageBox', 'Add Coins?', {
    inText: Message('message'),
    inTitle: Custom('State Machine'),
    outConfirmed: Message('add_coin'),
    optType: 'yesno'
  })
    .then('8a2e15', 'Core.Programming.Switch', 'Switch', {
    outputs: 2,
    optConditions: ['msg.add_coin', '!msg.add_coin']
  });
  f.node('0efb17', 'Core.Programming.Switch', 'Check Coin', {
    outputs: 2,
    optConditions: ['msg.coin === 0', 'msg.coin > 0']
  });
  f.node('042f2b', 'Core.Flow.End', '(1) Exit', { sfPort: 0 });
  f.node('aa71ba', 'Core.Flow.End', '(3) Next State', { sfPort: 2 });
  f.node('783fa1', 'Core.Flow.End', '(2) Ask Again', { sfPort: 1 });
  f.node('757047', 'Core.Programming.Function', 'Increase Coin', { func: 'msg.coin++;\nreturn msg;' });

  f.edge('8a2e15', 0, '757047', 0);
  f.edge('8a2e15', 1, '0efb17', 0);
  f.edge('0efb17', 1, 'aa71ba', 0);
  f.edge('757047', 0, '783fa1', 0);
  f.edge('0efb17', 0, '042f2b', 0);
});
