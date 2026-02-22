import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Prepare Request', (f) => {
  f.node('0db47a', 'Core.Flow.Label', 'Try Again', {})
    .then('2bd577', 'Core.Programming.Switch', 'Check Try Count', {
    outputs: 2,
    optConditions: ['msg.tryCount > 30', 'msg.tryCount <= 30'],
    delayAfter: 10
  });
  f.node('e6df9d', 'Core.Flow.Begin', 'Begin', {})
    .then('d4116b', 'Core.Programming.Function', 'Prepare Request', {
    func: 'msg.tryCount = 0;\nmsg.headers = {};\nmsg.gRecaptchaResponse = "";\n\nmsg.body = {\n    "clientKey": msg.clientKey,\n    "task": {\n        "type": "NoCaptchaTaskProxyless",\n        "websiteURL": msg.websiteURL,\n        "websiteKey": msg.websiteKey\n    }\n}\n\nreturn msg;\n'
  })
    .then('85363a', 'Core.Net.HttpRequest', 'Send Challenge', {
    inBody: Message('body'),
    inCookies: Message('cookies'),
    inCustomCookies: [],
    inCustomHeaders: [{"name": "Content-Type", "value": "application/json"}],
    inHeaders: Message('headers'),
    outBody: Message('body'),
    outCookies: Message('cookies'),
    outHeaders: Message('headers'),
    optAuthentication: 'no-authentication',
    optMethod: 'post',
    optUrl: Custom('https://api.anti-captcha.com/createTask'),
    delayAfter: 10
  });
  f.node('8eb11b', 'Core.Flow.Label', 'Success', {})
    .then('f3c261', 'Core.Programming.Function', 'gRecaptchaResponse', {
    func: 'if (msg.body && msg.body.solution && msg.body.solution.gRecaptchaResponse) {\n  msg.gRecaptchaResponse = msg.body.solution.gRecaptchaResponse;\n}\nreturn msg;\n'
  })
    .then('5707b5', 'Core.Browser.RunScript', 'Set gRecaptchaResponse', {
    func: 'var textarea = document.evaluate(\'//textarea[@id="g-recaptcha-response"]\', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\ntextarea.value = msg.gRecaptchaResponse;\n\n',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('ca7540', 'Core.Programming.Function', 'Prepare Request', {
    func: 'if (!msg.taskId) {\n  msg.taskId = msg.body.taskId;\n}\nmsg.tryCount++;\nmsg.headers = {};\nmsg.body = {\n    "clientKey": msg.clientKey,\n    "taskId": msg.taskId\n}\n\nreturn msg;\n'
  })
    .then('67528a', 'Core.Net.HttpRequest', 'Get Result', {
    inBody: Message('body'),
    inCookies: Message('cookies'),
    inCustomCookies: [],
    inCustomHeaders: [{"name": "Content-Type", "value": "application/json"}],
    inHeaders: Message('headers'),
    outBody: Message('body'),
    outCookies: Message('cookies'),
    outHeaders: Message('headers'),
    optAuthentication: 'no-authentication',
    optMethod: 'post',
    optUrl: Custom('https://api.anti-captcha.com/getTaskResult')
  })
    .then('9c0e08', 'Core.Programming.Switch', 'Check Result', {
    outputs: 2,
    optConditions: ['msg.body.status !== "ready"', 'msg.body.status === "ready"']
  });
  f.node('c1a320', 'Core.Flow.GoTo', 'Go To Success', { optNodes: { ids: ['8eb11b'], type: 'goto', all: false } });
  f.node('dcd2f8', 'Core.Flow.GoTo', 'Go to Try Again', { optNodes: { ids: ['0db47a'], type: 'goto', all: false } });
  f.node('fc1afe', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('85363a', 0, 'ca7540', 0);
  f.edge('9c0e08', 0, 'dcd2f8', 0);
  f.edge('2bd577', 0, 'fc1afe', 0);
  f.edge('2bd577', 1, 'ca7540', 0);
  f.edge('9c0e08', 1, 'c1a320', 0);
  f.edge('5707b5', 0, 'fc1afe', 0);
});
