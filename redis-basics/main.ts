import { flow, Custom, Message, Credential } from '@robomotion/sdk';

flow.create('9b66a046-ace4-428e-88fc-ac01c6888a78', 'Imported Redis Basics', (f) => {
  f.addDependency('Robomotion.Redis', '1.0.4');

  f.node('c0a1b2', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Redis Basics How-To\n\nThis template demonstrates the basic `Connect → Set → Get → Disconnect` pattern of the Robomotion Redis package.\n\nFollow these steps to run it;\n\n**1.** Add a Redis credential item to a Vault (server, port, password, database)\n\n**2.** Select that credential on the `Connect` node\n\n**3.** Run the flow — it will store a key, read it back, and show the result in a dialog',
  });

  f.node('42ec21', 'Core.Trigger.Inject', 'Start', {})
    .then('a06926', 'Robomotion.Redis.Connect', 'Connect', {
      optCredentials: Credential({ vaultId: '_', itemId: '_' }),
    })
    .then('8e1c4b', 'Robomotion.Redis.Set', 'Set Key', {
      inKey: Custom('my_key'),
      inValue: Custom('hello redis'),
    })
    .then('c47e90', 'Robomotion.Redis.Get', 'Get Key', {
      inKey: Custom('my_key'),
      outValue: Message('result'),
    })
    .then('f3a8d1', 'Core.Dialog.MessageBox', 'Show Result', {
      inTitle: Custom('Redis Basics'),
      inText: Message('result'),
    })
    .then('e1f392', 'Robomotion.Redis.Disconnect', 'Disconnect', {})
    .then('b9a841', 'Core.Flow.Stop', 'Stop', {});
}).start();
