import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Port', (f) => {
  f.node('4d9089', 'Core.Flow.Begin', 'Begin', {})
    .then('d85ae0', 'Robomotion.Monitoring.Port', 'Port', {
    inIP: Message('site'),
    inPort: Custom('443'),
    outResult: Message('isOpen'),
    optCheckPort: 'open',
    optTimeout: Custom('30')
  })
    .then('1e6018', 'Core.Programming.Function', 'Config', {
    func: 'if (!msg.isOpen) {\n  throw msg.site + " 443 port is closed";\n}\n\nreturn msg;'
  })
    .then('fd1b4f', 'Core.Flow.End', 'End', { sfPort: 0 });
});
