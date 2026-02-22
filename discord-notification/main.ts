import { flow, Message } from '@robomotion/sdk';

flow.create('15adf87d-8af3-466b-8734-489055daf3e5', 'Send Discord Notification', (f) => {
  f.node('fe6582', 'Core.Flow.Comment', 'Comment', {
    optText: '## Send Discord Notification\n\nThis template sends a notification to a Discord webhook\n\n### How it Works?\n\n**1.** Edit "Config" node and set your Discord Webhook URL\n\n**2.** Edit "Prepare Message" function and update the message to send\n\n**3.** Edit "Prepare Embed" function and update the embed to send\n\n'
  });
  f.node('cc0f06', 'Core.Trigger.Inject', 'Start', {})
    .then('8e98c4', 'Core.Programming.Function', 'Config', {
    func: 'msg.webhook = "https://discord.com/api/webhooks/your_webhook_here";\n\nreturn msg;\n'
  })
    .then('f787d2', 'Core.Programming.Function', 'Prepare Message', {
    func: '// This is the simplest message you can send to Discord\n\nmsg.req = {\n\n   "content": "Hello World" ,\n   \n}\n\nreturn msg;',
    continueOnError: true
  })
    .then('cdccaf', 'Core.Net.HttpRequest', 'Send to Discord', {
    inBody: Message('req'),
    inHeaders: Message('reqHeaders'),
    inCustomHeaders: [{"name": "Content-Type", "value": "application/json"}],
    inCustomCookies: [],
    inCookies: Message('reqCookies'),
    outBody: Message('resp'),
    outHeaders: Message('respHeaders'),
    outCookies: Message('respCookies'),
    outStatus: Message('respStatus'),
    optUrl: Message('webhook'),
    optMethod: 'post',
    optAuthentication: 'no-authentication',
    continueOnError: true
  })
    .then('008e20', 'Core.Programming.Function', 'Prepare Embed', {
    func: '// This is an advanced message that is called an Embed\n//\n// For more info here:\n// https://discordjs.guide/popular-topics/embeds.html#embed-preview\n// \n// For more advanced usage, this article also may help\n// https://dev.to/oskarcodes/send-automated-discord-messages-through-webhooks-using-javascript-part-2-embeds-588n\n\nvar embed = {\n\n    "title": "Something Happened",\n    "color": 0x0099ff,\n    "description": "And this is the description of it"\n\n}\n\nmsg.req = {\n  "embeds": [embed]\n}\n\nreturn msg;',
    continueOnError: true
  })
    .then('727643', 'Core.Net.HttpRequest', 'Send to Discord', {
    inBody: Message('req'),
    inHeaders: Message('reqHeaders'),
    inCustomHeaders: [{"name": "Content-Type", "value": "application/json"}],
    inCustomCookies: [],
    inCookies: Message('reqCookies'),
    outBody: Message('resp'),
    outHeaders: Message('respHeaders'),
    outCookies: Message('respCookies'),
    outStatus: Message('respStatus'),
    optUrl: Message('webhook'),
    optMethod: 'post',
    optAuthentication: 'no-authentication',
    continueOnError: true
  })
    .then('22dd56', 'Core.Flow.Stop', 'Stop', {});
}).start();
