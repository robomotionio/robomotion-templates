import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('0887bfb9-062b-47d5-b720-8706133e21ec', 'State Machine Example', (f) => {
  f.node('d9dbe8', 'Core.Flow.Comment', 'Comment', {
    optText: '##### State Machine Example How-To \n\nThis template uses *Dialog* and *Function* nodes to simulate a basic Finite State\nMachine example. It is inspired by a vending machine, where you can put some\ncoins in and get some items out.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.coin field to the amount of extra coins you want to get at \nthe beginning. (Optional)'
  });
  f.node('d3a839', 'Core.Trigger.Inject', 'Inject', {})
    .then('d7b962', 'Core.Programming.Function', 'Config', { func: 'msg.coin = 0;\nmsg.items = {};\nreturn msg;' })
    .then('82a473', 'Core.Flow.SubFlow', 'Initial State', { subflow: '61c3d59f-df2d-4e28-a36f-84104aaf44dc' });
  f.node('21dc20', 'Core.Flow.Label', 'State 2 Label', {})
    .then('9e35e1', 'Core.Flow.SubFlow', 'State 2', {
    outputs: 2,
    subflow: '1c0ae27a-3c53-4111-b9d2-5bf5517482ce'
  });
  f.node('e35009', 'Core.Flow.Label', 'State 4 Label', {})
    .then('528c85', 'Core.Flow.SubFlow', 'State 4', { subflow: '93dd733a-5fb9-4630-9d56-0901adda1569' })
    .then('5b90b6', 'Core.Flow.Stop', 'Stop', { delayBefore: 2 });
  f.node('a0b58a', 'Core.Flow.Label', 'State 1 Label', {});
  f.node('92a197', 'Core.Flow.Label', 'State 3 Label', {})
    .then('855216', 'Core.Flow.SubFlow', 'State 3', {
    outputs: 3,
    subflow: '1a0dd47b-a2e0-4590-abdf-954a78c80105'
  });
  f.node('afc482', 'Core.Flow.SubFlow', 'State 1', {
    outputs: 3,
    subflow: 'cc93d54f-7ccf-4f0b-9997-c35332d6f590'
  });
  f.node('f22c74', 'Core.Flow.GoTo', 'Go To State 4', { optNodes: { ids: ['e35009'], type: 'goto', all: false } });
  f.node('90943f', 'Core.Flow.GoTo', 'Go To State 1', { optNodes: { ids: ['a0b58a'], type: 'goto', all: false } });
  f.node('417889', 'Core.Flow.GoTo', 'Go To State 2', { optNodes: { ids: ['21dc20'], type: 'goto', all: false } });
  f.node('8cf3b5', 'Core.Flow.GoTo', 'Go To State 2', { optNodes: { ids: ['21dc20'], type: 'goto', all: false } });
  f.node('778ab5', 'Core.Flow.GoTo', 'Go To State 4', { optNodes: { ids: ['e35009'], type: 'goto', all: false } });
  f.node('e22dea', 'Core.Flow.GoTo', 'Go To State 2', { optNodes: { ids: ['21dc20'], type: 'goto', all: false } });
  f.node('8ef062', 'Core.Flow.GoTo', 'Go To State 3', { optNodes: { ids: ['92a197'], type: 'goto', all: false } });
  f.node('b483a9', 'Core.Flow.GoTo', 'Go To State 1', { optNodes: { ids: ['a0b58a'], type: 'goto', all: false } });

  f.edge('82a473', 0, 'afc482', 0);
  f.edge('afc482', 0, 'f22c74', 0);
  f.edge('a0b58a', 0, 'afc482', 0);
  f.edge('afc482', 1, '90943f', 0);
  f.edge('afc482', 2, '417889', 0);
  f.edge('855216', 0, 'b483a9', 0);
  f.edge('855216', 1, '8cf3b5', 0);
  f.edge('855216', 2, 'e22dea', 0);
  f.edge('9e35e1', 0, '8ef062', 0);
  f.edge('9e35e1', 1, '778ab5', 0);
}).start();
