import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Control', (f) => {
  f.node('51d326', 'Core.Flow.Begin', 'Begin', {})
    .then('7c4505', 'Robomotion.Monitoring.SSL', 'SSL', {
    inPort: Custom('443'),
    inURL: Message('site'),
    outExpiry: Message('expiresIn'),
    outValid: Message('isValid'),
    optTimeout: Custom('30')
  })
    .then('a3b972', 'Core.Programming.Function', 'Control', {
    func: 'if (msg.expiresIn <= 30) {\n  throw msg.site + " SSL will expire in " + msg.expiresIn + " days.";\n}\n\nreturn msg;'
  })
    .then('3b7b77', 'Core.Flow.End', 'End', { sfPort: 0 });
});
