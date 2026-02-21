import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Read CSV Files', (f) => {
  f.node('c3b953', 'Core.Flow.Begin', 'Begin', {})
    .then('1ada4e', 'Core.FileSystem.List', 'List Input Directory', {
    inDirPath: Message('in_dir'),
    inNameFilter: Custom('[a-zA-Z]*.csv'),
    optTop: 10000
  });
  f.node('6c0c4f', 'Core.Flow.Label', 'Next Fİle', {});
  f.node('65abdc', 'Core.Programming.ForEach', 'For Each File', { optInput: Message('files'), optOutput: Message('file') })
    .then('2a1886', 'Core.Programming.Function', 'Function', { func: 'msg.file = `${msg.in_dir}/${msg.file.Name}`;\nreturn msg;' })
    .then('5598cc', 'Core.Programming.Switch', 'Check Seperator', { optConditions: [{ scope: 'Custom', name: 'msg.separator === \';\'' }, { scope: 'Custom', name: 'msg.separator === \'TAB\'' }, { scope: 'Custom', name: 'msg.separator === \'SPACE\'' }, { scope: 'Custom', name: 'msg.separator === \',\'' }, { scope: 'Custom', name: 'msg.separator !== \';\' && msg.seperator === \',\' && msg.seperator !== \'TAB\' && msg.seperator !== \'SPACE\'' }] })
    .then('ffd192', 'Core.CSV.ReadCSV', 'Read CSV', { inFilePath: Message('file'), outTable: Message('sub_table') });
  f.node('dd64cf', 'Core.Flow.End', 'End', {});
  f.node('bd6236', 'Core.CSV.ReadCSV', 'Read CSV', { inFilePath: Message('file'), outTable: Message('sub_table') });
  f.node('78b768', 'Core.CSV.ReadCSV', 'Read CSV', { inFilePath: Message('file'), outTable: Message('sub_table') });
  f.node('197d2c', 'Core.CSV.ReadCSV', 'Read CSV', { inFilePath: Message('file'), outTable: Message('sub_table') });
  f.node('e89ab8', 'Core.Programming.Function', 'Function', { func: 'if (msg.table.columns.length === 0) msg.table.columns = msg.sub_table.columns;\nmsg.table.rows.push(...msg.sub_table.rows);\nreturn msg;' })
    .then('7a5e52', 'Core.Flow.GoTo', 'Go To', { optNodes: { ids: ['6c0c4f'], type: 'goto', all: false } });

  f.edge('1ada4e', 0, '65abdc', 0);
  f.edge('6c0c4f', 0, '65abdc', 0);
  f.edge('65abdc', 1, 'dd64cf', 0);
  f.edge('5598cc', 4, '197d2c', 0);
  f.edge('5598cc', 2, 'bd6236', 0);
  f.edge('5598cc', 1, '78b768', 0);
  f.edge('5598cc', 3, '197d2c', 0);
  f.edge('78b768', 0, 'e89ab8', 0);
  f.edge('ffd192', 0, 'e89ab8', 0);
  f.edge('bd6236', 0, 'e89ab8', 0);
  f.edge('197d2c', 0, 'e89ab8', 0);
});