import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Buy More?', (f) => {
  f.node('72b93e', 'Core.Flow.Begin', 'Begin', {})
    .then('4eb899', 'Core.Dialog.MessageBox', 'Buy More?', {
    inText: Custom('Do you want to buy some items?'),
    inTitle: Custom('State Machine'),
    outConfirmed: Message('buy_more'),
    optType: 'yesno'
  })
    .then('3e1f43', 'Core.Programming.Switch', 'Check More', {
    outputs: 2,
    optConditions: ['msg.buy_more', '!msg.buy_more']
  });
  f.node('3ae4da', 'Core.Flow.End', '(2) No', { sfPort: 1 });
  f.node('6baa6c', 'Core.Flow.End', '(1) Yes', { sfPort: 0 });

  f.edge('3e1f43', 0, '6baa6c', 0);
  f.edge('3e1f43', 1, '3ae4da', 0);
});
