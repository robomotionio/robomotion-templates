import { subflow, Message } from '@robomotion/sdk';

subflow.create('Import Text File', (f) => {
  f.node('f80487', 'Core.Flow.Begin', 'Begin', {})
    .then('17036d', 'Core.Programming.Switch', 'Switch', { optConditions: [{ scope: 'Custom', name: 'msg.url.length > 0' }, { scope: 'Custom', name: 'msg.url.length == 0' }] });
  f.node('165923', 'Core.FileSystem.ReadFile', 'Read File', { inPath: Message('import_from') })
    .then('cf42b9', 'Core.Programming.Function', 'Function', { func: 'msg.url = `https://translate.google.com/?sl=${msg.translate_from}&tl=${msg.translate_to}&text=${msg.text}&op=translate`;\nreturn msg;' });
  f.node('0046ce', 'Core.Flow.End', 'End', {});

  f.edge('17036d', 0, '0046ce', 0);
  f.edge('17036d', 1, '165923', 0);
  f.edge('cf42b9', 0, '0046ce', 0);
});