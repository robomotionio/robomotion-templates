import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('7bccf464-059f-4ee2-a8e8-9bccdf4b3b7c', 'Service Monitor', (f) => {
  f.node('287321', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Service Monitor How-To\n \n This template uses Monitoring package to check service liveness.\n\n1. Go to Flow Designer and press package icon above the node palette.\n2. You should see Monitoring package icon, install it.\n3. Update the sites field in Config node.\n'
  });
  f.node('9af893', 'Core.Trigger.Inject', 'Start', {})
    .then('625f9a', 'Core.Programming.Function', 'Config', {
    func: 'msg.sites = [\n  "www.google.com",\n  "www.amazon.com",\n  "www.shopify.com"\n];\n\nreturn msg;'
  });
  f.node('0b1ccb', 'Core.Trigger.Catch', 'Catch', {
    optNodes: { ids: ['116b02', '97a7d8'], type: 'goto', all: false }
  });
  f.node('3769a9', 'Core.Flow.Label', 'Next Site', {});
  f.node('01f66e', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
  f.node('dddfa1', 'Core.Flow.GoTo', 'Go To Next Site', { optNodes: { ids: ['3769a9'], type: 'goto', all: false } });
  f.node('2e4ef5', 'Core.Programming.ForEach', 'For Each Site', {
    outputs: 2,
    optInput: Message('sites'),
    optOutput: Message('site')
  });
  f.node('116b02', 'Core.Flow.SubFlow', 'Check Site', { subflow: '3d5c13a4-498d-46ba-8656-676c556f29ce' })
    .then('97a7d8', 'Core.Flow.SubFlow', 'Check SSL', { subflow: '28f238e4-5828-4c33-ab9a-d475b419601b' })
    .then('f60e7c', 'Core.Flow.SubFlow', 'Check Port', { subflow: '623dcbf7-4317-43bb-b1c9-4fad011496dd' })
    .then('53aea6', 'Core.Flow.GoTo', 'Go To Next Site', { optNodes: { ids: ['3769a9'], type: 'goto', all: false } });
  f.node('59e8ac', 'Core.Flow.Stop', 'Stop', {});

  f.edge('625f9a', 0, '2e4ef5', 0);
  f.edge('2e4ef5', 0, '116b02', 0);
  f.edge('2e4ef5', 1, '59e8ac', 0);
  f.edge('3769a9', 0, '2e4ef5', 0);
  f.edge('0b1ccb', 0, '01f66e', 0);
  f.edge('0b1ccb', 0, 'dddfa1', 0);
}).start();
