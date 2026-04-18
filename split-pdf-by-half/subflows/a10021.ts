import { subflow, Message } from '@robomotion/sdk';

subflow.create('Compute Half', (f) => {
  f.node('c10001', 'Core.Flow.Begin', 'Begin', {})
    .then('c10002', 'Core.Programming.Function', 'Even Or Odd', {
      func: `var c = Number(msg.page_count) || 0; msg.even = (c % 2) === 0; msg.half = msg.even ? (c / 2) : ((c - 1) / 2); return msg;`,
    })
    .then('c10003', 'Core.Flow.End', 'End', { sfPort: 0 });
});
