import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Website', (f) => {
  f.node('a401c0', 'Core.Flow.Begin', 'Begin', {})
    .then('947819', 'Robomotion.Monitoring.Website', 'Website', {
    inURL: Message('site'),
    outAlive: Message('isAlive'),
    optTimeout: Custom('30')
  })
    .then('fa672a', 'Core.Programming.Function', 'Control', {
    func: 'if (!msg.isAlive) {\n  throw msg.site + " is down!"\n}\n\nreturn msg;'
  })
    .then('0a4997', 'Core.Flow.End', 'End', { sfPort: 0 });
});
