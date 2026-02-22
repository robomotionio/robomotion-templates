import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Read CSV', (f) => {
  f.node('7c90fc', 'Core.Flow.Begin', 'Begin', {});
  f.node('0c61b1', 'Core.Programming.Switch', 'Check Separator', {
    outputs: 5,
    optConditions: ['msg.separator === \';\'', 'msg.separator === \'TAB\'', 'msg.separator === \'SPACE\'', 'msg.separator === \',\'', 'msg.separator !== \';\' && msg.seperator === \',\' && msg.seperator !== \'TAB\' && msg.seperator !== \'SPACE\'']
  });
  f.node('47c5f5', 'Core.CSV.ReadCSV', 'Read CSV', {
    inFilePath: Message('csv_path'),
    outTable: Message('table'),
    optSeparator: 'space',
    optOffset: Custom('0')
  });
  f.node('6c0c39', 'Core.CSV.ReadCSV', 'Read CSV', {
    inFilePath: Message('csv_path'),
    outTable: Message('table'),
    optSeparator: 'comma',
    optOffset: Custom('0')
  });
  f.node('05d47a', 'Core.CSV.ReadCSV', 'Read CSV', {
    inFilePath: Message('csv_path'),
    outTable: Message('table'),
    optSeparator: 'tab',
    optOffset: Custom('0')
  });
  f.node('a0bff1', 'Core.CSV.ReadCSV', 'Read CSV', {
    inFilePath: Message('csv_path'),
    outTable: Message('table'),
    optSeparator: 'semicolon',
    optOffset: Custom('0')
  });
  f.node('d785b0', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('7c90fc', 0, '0c61b1', 0);
  f.edge('0c61b1', 0, 'a0bff1', 0);
  f.edge('0c61b1', 1, '05d47a', 0);
  f.edge('0c61b1', 2, '47c5f5', 0);
  f.edge('0c61b1', 3, '6c0c39', 0);
  f.edge('6c0c39', 0, '0c61b1', 4);
  f.edge('a0bff1', 0, 'd785b0', 0);
  f.edge('d785b0', 0, '05d47a', 0);
  f.edge('47c5f5', 0, 'd785b0', 0);
  f.edge('d785b0', 0, '6c0c39', 0);
});
