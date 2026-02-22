import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('f8264ef1-0605-4869-8d58-8f5ecd407596', 'Pabbly Triggers', (f) => {
  f.node('212c8f', 'Core.Flow.Comment', 'Comment', {
    optText: '# Pabbly Triggers\nThis template uses *Net* nodes for trigger operations between Robomotion and Pabbly.\n\n## How it Works?\n\n1. Install ngrok from [here](https://ngrok.com/download) \n\n2. run ngrok http 9090 from ngrok console\n\n3. Edit the Prepare Request node (Function)\n\n4. Set the msg.webhookUrl to your webhook url from Pabbly\'s Webhook by Pabbly step.\n\n5. Set the API by Pabbly step\'s Action Event type to POST.\n\n6. Set the API by Pabbly step\'s API Endpoint URL to your ngrok\'s forwarding url.'
  });
  f.node('53acc3', 'Core.Trigger.Inject', 'Inject', {})
    .then('9d7d18', 'Core.Programming.Function', 'Prepare Request', {
    func: 'msg.webhookUrl = "https://connect.pabbly.com/workflow/sendwebhookdata/"; // Pabbly workflow webhook url.\nmsg.req = {\n  "payload":"{\\"text\\":\\"Hi Pabbly from Robomotion!\\"}",\n}; // request.\nreturn msg;'
  })
    .then('889197', 'Core.Net.HttpRequest', 'Http Request', {
    inBody: Message('req'),
    inHeaders: Message('reqHeaders'),
    inCustomHeaders: [{"name": "Content-Type", "value": "application/json"}],
    inCustomCookies: [],
    inCookies: Message('reqCookies'),
    outBody: Message('resp'),
    outHeaders: Message('respHeaders'),
    outCookies: Message('respCookies'),
    outStatus: Message('respStatus'),
    optUrl: Message('webhookUrl'),
    optMethod: 'post',
    optAuthentication: 'no-authentication',
    optCredentials: Custom('{'vaultId': '_', 'itemId': '_'}'),
    optProxyCredentials: Custom('{'vaultId': '_', 'itemId': '_'}')
  })
    .then('499238', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
  f.node('10fb63', 'Core.Net.HttpIn', 'Http In', {
    outBody: Message('body'),
    outHeaders: Message('headers'),
    outCookies: Message('cookies'),
    optMethod: 'POST',
    optEndpoint: '/',
    optIP: '127.0.0.1',
    optPort: 9090
  })
    .then('e2b4d7', 'Core.Programming.Function', 'Prepare Response', {
    func: 'msg.body = "Hi Robomotion from Pabbly!";\nreturn msg;'
  })
    .then('fd07fc', 'Core.Net.HttpOut', 'Http Out', {
    inStatus: Custom('200'),
    inBody: Message('body'),
    inHeaders: Message('headers'),
    inCustomHeaders: [{"name": "Content-Type", "value": "application/json"}],
    inCustomCookies: [],
    inCookies: Message('cookies')
  });
}).start();
