import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Print All', (f) => {
  f.node('de17ee', 'Core.Flow.Begin', 'Begin', {})
    .then('606c0a', 'Core.Programming.Function', 'Print All', {
    func: 'msg.message = \'\';\nconst items = Object.keys(msg.items);\nif (items.length > 0) {\n  msg.message += `You bought the following items:\\n`\n  for (var i = 0; i < items.length; i++) {\n    const item = items[i];\n    msg.message += `Item ${item}: ${msg.items[item]} pcs\\n`\n  }\n  msg.message += \'\\n\';\n}\n\nmsg.message += `You have ${msg.coin} coin(s) left.`\nreturn msg;'
  })
    .then('da4b98', 'Core.Dialog.MessageBox', 'Message Box', {
    inText: Message('message'),
    inTitle: Custom('State Machine')
  })
    .then('8534cd', 'Core.Flow.End', 'End', { sfPort: 0 });
});
