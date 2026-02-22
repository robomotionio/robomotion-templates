import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Get Item ID', (f) => {
  f.node('623eb7', 'Core.Flow.Begin', 'Begin', {})
    .then('7d7c3f', 'Core.Programming.Switch', 'Coin Check', {
    outputs: 2,
    optConditions: ['msg.coin > 0', 'msg.coin === 0']
  });
  f.node('55f24e', 'Core.Dialog.InputBox', 'Get Item ID', {
    inText: Custom('Which item do you want? (1/2/3)'),
    inTitle: Custom('State Machine'),
    outText: Message('item'),
    optDefault: Custom('1')
  })
    .then('333ede', 'Core.Programming.Function', 'Function', {
    outputs: 3,
    func: 'const item_id = parseInt(msg.item);\n\nif (item_id < 1 || item_id > 3 || isNaN(item_id)) {\n  return [null, msg, null];\n}\n\nif (msg.coin < item_id) {\n  msg.message = `You do not have enough coins to buy this item. This item costs ${item_id} coin(s).`\n  return [null, null, msg];\n}\n\nmsg.coin -= item_id;\nmsg.message = `You bought some items, and you have ${msg.coin} coin(s) left.`\n\nif (item_id in msg.items) msg.items[item_id]++;\nelse msg.items[item_id] = 1;\n\nreturn msg;'
  });
  f.node('ca7361', 'Core.Dialog.MessageBox', 'Not Enough Coins', {
    inText: Message('message'),
    inTitle: Custom('State Machine')
  });
  f.node('f68e1b', 'Core.Flow.End', '(1) Need More Coin', { sfPort: 0 });
  f.node('3e6aef', 'Core.Flow.End', '(2) Ask Again', { sfPort: 1 });
  f.node('c99ef6', 'Core.Dialog.MessageBox', 'Purchase Info', {
    inText: Message('message'),
    inTitle: Custom('State Machine')
  })
    .then('c56515', 'Core.Flow.End', '(3) More?', { sfPort: 2 });
  f.node('99d2d6', 'Core.Dialog.MessageBox', 'Invalid Item', {
    inText: Custom('Invalid item id.'),
    inTitle: Custom('State Machine'),
    optType: 'error'
  });

  f.edge('333ede', 2, 'ca7361', 0);
  f.edge('f68e1b', 0, 'ca7361', 0);
  f.edge('333ede', 1, '99d2d6', 0);
  f.edge('99d2d6', 0, '3e6aef', 0);
  f.edge('333ede', 0, 'c99ef6', 0);
  f.edge('7d7c3f', 1, 'f68e1b', 0);
  f.edge('7d7c3f', 0, '55f24e', 0);
});
