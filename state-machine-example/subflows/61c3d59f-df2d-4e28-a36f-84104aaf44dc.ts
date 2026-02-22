import { subflow, Custom } from '@robomotion/sdk';

subflow.create('Welcome Message', (f) => {
  f.node('fdc2e8', 'Core.Flow.Begin', 'Begin', {})
    .then('20e680', 'Core.Dialog.MessageBox', 'Welcome Message', {
    inText: Custom('Welcome to State Machine.'),
    inTitle: Custom('State Machine')
  })
    .then('e1758e', 'Core.Flow.End', 'End', { sfPort: 0 });
});
