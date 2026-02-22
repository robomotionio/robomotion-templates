import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('7184ff4b-16c3-47ae-a00e-64adf6253afd', 'Imported API Health Check', (f) => {
  f.node('df5ef9', 'Core.Flow.Comment', 'Comment', { optText: '##### API Health check How-To \n\nThis template uses the *Net > Http Request* node to test if an endpoint works or not.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.endpoint URL to the API you want to test\n' });
  f.node('156d06', 'Core.Trigger.Inject', 'Start', {})
    .then('9c904f', 'Core.Programming.Function', 'Config', { func: '// The API endpoint to check\nmsg.endpoint = "https://api.robomotion.io/version";\n\nreturn msg;' })
    .then('7acefa', 'Core.Net.HttpRequest', 'Test Endpoint', {
    inCustomHeaders: [{ name: 'Content-Type', value: 'application/json' }],
    optProxyCredentials: { itemId: '_', vaultId: '_' },
    optUrl: Message('endpoint'),
    optCredentials: { itemId: '_', vaultId: '_' },
    optMethod: 'get'
  })
    .then('d533df', 'Core.Programming.Switch', 'Check Status Code', { optConditions: ['msg.respStatus === 500', 'msg.respStatus === 200'] })
    .then('c2c30e', 'Core.Dialog.MessageBox', 'Internal Error 500', {
    inText: Custom('Failed'),
    inTitle: Custom('Test Endpoint'),
    optType: 'error'
  });
  f.node('e75a00', 'Core.Dialog.MessageBox', 'OK 200', { inTitle: Custom('Test Endpoint'), inText: Custom('Everything is OK') });
  f.node('28a999', 'Core.Flow.Stop', 'Stop', {});

  f.edge('c2c30e', 0, '28a999', 0);
  f.edge('e75a00', 0, '28a999', 0);
  f.edge('d533df', 1, 'e75a00', 0);
}).start();