import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Export Translation', (f) => {
  f.node('52e02b', 'Core.Flow.Begin', 'Begin', {})
    .then('ba7949', 'Core.Programming.Switch', 'Switch', { optConditions: [{ scope: 'Custom', name: 'msg.export_to.length === 0' }, { scope: 'Custom', name: 'msg.export_to.length > 0' }] })
    .then('ec95eb', 'Core.Dialog.MessageBox', 'Message Box', { inTitle: Custom('Translation:'), inText: Message('translation') });
  f.node('67a85c', 'Core.FileSystem.WriteFile', 'Write File', {
    inPath: Message('export_to'),
    inText: Message('translation'),
    optMode: 'truncate'
  });
  f.node('baaa86', 'Core.Flow.End', 'End', {});

  f.edge('ec95eb', 0, 'baaa86', 0);
  f.edge('ba7949', 1, '67a85c', 0);
  f.edge('67a85c', 0, 'baaa86', 0);
});