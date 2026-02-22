import { subflow, Message } from '@robomotion/sdk';

subflow.create('Write CSV', (f) => {
  f.node('afa61f', 'Core.Flow.Begin', 'Begin', {})
    .then('59d35c', 'Core.FileSystem.PathExists', 'Path Exists', {
    inPath: Message('csv_path'),
    outResult: Message('exists')
  })
    .then('219802', 'Core.Programming.Switch', 'Check if exists', {
    outputs: 2,
    optConditions: ['msg.exists', '!msg.exists']
  });
  f.node('fc4ba3', 'Core.FileSystem.Create', 'Create CSV File', {
    inPath: Message('csv_path'),
    outPath: Message('path'),
    optType: 'file'
  });
  f.node('c4a6ed', 'Core.Programming.Switch', 'Separator check', {
    outputs: 3,
    optConditions: ['msg.separator === \',\'', 'msg.separator === \';\'', 'msg.separator !== \',\' && msg.separator !== \';\'']
  });
  f.node('58a2b6', 'Core.CSV.WriteCSV', 'Write CSV', {
    inFilePath: Message('csv_path'),
    inTable: Message('table'),
    optSeparator: 'semicolon',
    optEncoding: 'utf8'
  });
  f.node('271018', 'Core.CSV.WriteCSV', 'Write CSV', {
    inFilePath: Message('csv_path'),
    inTable: Message('table'),
    optSeparator: 'comma',
    optEncoding: 'utf8'
  });
  f.node('d739ec', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('c4a6ed', 1, '58a2b6', 0);
  f.edge('271018', 0, 'c4a6ed', 0);
  f.edge('271018', 0, 'd739ec', 0);
  f.edge('d739ec', 0, '58a2b6', 0);
  f.edge('fc4ba3', 0, 'c4a6ed', 0);
  f.edge('219802', 0, 'c4a6ed', 0);
  f.edge('219802', 1, 'fc4ba3', 0);
  f.edge('c4a6ed', 2, '271018', 0);
});
