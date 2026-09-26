import { flow, Custom } from '@robomotion/sdk';

flow.create('b199d98a-476c-47a3-b3a0-ecc813800591', 'Imported JSON Minifier', (f) => {
  f.node('d13c7b', 'Core.Flow.Comment', 'Comment', { optText: '##### JSON Minifier How-To \n\nThis template uses *Programming* and *Dialog* nodes to minimize a given JSON object.\nThe result will be printed in Output Panel.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.json field to the JSON object you want to minimize.\n\n**3.** Debug shows the result in the Output Panel. System Console is enabled\nto print it in the Robot terminal when started from a command line.' });
  f.node('09e15d', 'Core.Trigger.Inject', 'Start', {})
    .then('c03c75', 'Core.Programming.Function', 'Config', { outputs: 2, func: '// [Required]\nmsg.json = {\n  "id": "613a15d8a0ff94364fde98b2",\n  "index": 0,\n  "guid": "cb44ba37-bfd0-4ca8-8783-a847812bd714",\n  "isActive": true,\n  "balance": "$3,518.87",\n  "picture": "http://placehold.it/32x32",\n  "age": 21,\n  "tags": [\n    "ullamco",\n    "excepteur",\n    "duis",\n    "deserunt",\n    "in",\n    "anim",\n    "eiusmod"\n  ],\n  "friends": [\n    {\n      "id": 0,\n      "name": "Regina Payne"\n    },\n    {\n      "id": 1,\n      "name": "Mcbride Hammond"\n    },\n    {\n      "id": 2,\n      "name": "Lydia Horton"\n    }\n  ]\n};\n\n// DO NOT edit below!\ntry {\n  msg.json = JSON.stringify(msg.json);\n}\ncatch (e) {\n  return [null, msg];\n}\nreturn [msg, null];' })
    .then('fc7fa5', 'Core.Programming.Debug', 'Debug', { optSysConsole: true });
  f.node('ad3b64', 'Core.Dialog.MessageBox', 'Invalid Warning', {
    inTitle: Custom('JSON Minifier'),
    inText: Custom('Invalid JSON'),
    optType: 'error'
  })
    .then('7b5171', 'Core.Flow.Stop', 'Stop', { delayBefore: 1 });

  f.edge('c03c75', 1, 'ad3b64', 0);
  f.edge('c03c75', 0, '7b5171', 0);
}).start();
