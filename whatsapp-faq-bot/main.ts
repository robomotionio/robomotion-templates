import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('48c7f5bb-ffdd-4bef-bf3f-2f9a9b18092d', 'WhatsApp FAQ Bot', (f) => {
  f.node('520ef0', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Whatsapp FAQ Bot\n\nThis template is WIP and uses the *Twilio > Send/Receive* nodes to creaete a simple Whatsapp FAQ\nbot.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Create conversation.json\n'
  });
  f.node('1de5e2', 'Core.Programming.Function', 'Config', {
    func: '// Conversation read from json configuration file\nmsg.conversation = JSON.parse(msg.text);\n\n// Your Twilio Sendbox Phone\nmsg.from = "+14155238886"\n\n// Your phone number\nmsg.to = ""\n\nmsg.isStarted = global.get("isStarted");\n\nreturn msg;\n'
  })
    .then('125e45', 'Core.Programming.Switch', 'Is First Message ?', {
    outputs: 2,
    optConditions: ['msg.isStarted === 0', 'msg.isStarted === 1']
  });
  f.node('c3485d', 'Core.FileSystem.ReadFile', 'Read Conversation', {
    inPath: Custom('C:\\Users\\John\\Conversation.json'),
    outContent: Message('text')
  });
  f.node('15611f', 'Robomotion.Twilio.ReceiveMessage', 'Receive Message', { inPort: Custom('') });
  f.node('947471', 'Core.Programming.Function', 'Welcome Message', {
    func: 'global.set("isStarted", 1);\n\nmsg.message = "Welcome to Robomotion Bot\\n\\tPress *1* for brief information\\n\\tPress *2* for technical support\\n\\tPress *3* for request a demo"\n\nreturn msg;'
  })
    .then('a13748', 'Robomotion.Twilio.SendMessage', 'Send Message', {
    inFrom: Custom(''),
    inMessage: Message('message'),
    inTo: Custom(''),
    outResponse: Message('response'),
    optAccountId: Credential({ vaultId: '7f7529a1-1a1e-4315-a304-a273df7adb16', itemId: 'd2c0142a-3738-4c3e-bf58-7ff5ef7c2761' }),
    optToken: Credential({ vaultId: '7f7529a1-1a1e-4315-a304-a273df7adb16', itemId: '0ac627ef-bba5-49a7-97fe-77bdb46482b6' })
  });
  f.node('6f4fc0', 'Core.Programming.Function', 'Prepare Response', {
    func: 'var state = global.get("state");\n\nmsg.message = "Invalid Number\\n" + msg.conversation[state];\n\nvar newState = state + "." + msg.body.Body;\n\nif (msg.body.Body === "m" || msg.body.Body === "M") {\n  newState = "1"\n}\n\nif (msg.conversation[newState] != undefined) {\n  global.set("state" , newState);\n  msg.message = msg.conversation[newState];\n}\n\nreturn msg;\n'
  })
    .then('931b19', 'Robomotion.Twilio.SendMessage', 'Send Message', {
    inFrom: Custom(''),
    inMessage: Message('message'),
    inTo: Custom(''),
    outResponse: Message('response'),
    optAccountId: Credential({ vaultId: '7f7529a1-1a1e-4315-a304-a273df7adb16', itemId: 'd2c0142a-3738-4c3e-bf58-7ff5ef7c2761' }),
    optToken: Credential({ vaultId: '7f7529a1-1a1e-4315-a304-a273df7adb16', itemId: '0ac627ef-bba5-49a7-97fe-77bdb46482b6' })
  });

  f.edge('125e45', 0, '947471', 0);
  f.edge('125e45', 1, '6f4fc0', 0);
  f.edge('c3485d', 0, '1de5e2', 0);
  f.edge('15611f', 0, 'c3485d', 0);
}).start();
