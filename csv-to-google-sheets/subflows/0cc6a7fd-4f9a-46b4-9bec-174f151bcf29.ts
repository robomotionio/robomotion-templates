import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Read CSV', (f) => {
  f.node('33a572', 'Core.Flow.Begin', 'Begin', {});
  f.node('f032d2', 'Core.Programming.Switch', 'Separator Check', {
    outputs: 3,
    optConditions: ['msg.separator === \',\'', 'msg.separator === \';\'', 'msg.separator !== \',\' && msg.separator !== \';\'']
  });
  f.node('7c94b8', 'Core.CSV.ReadCSV', 'Read CSV', {
    inFilePath: Message('csv_path'),
    outTable: Message('table'),
    optOffset: Custom('0'),
    optSeparator: 'comma'
  });
  f.node('8c6167', 'Core.CSV.ReadCSV', 'Read CSV', {
    inFilePath: Message('csv_path'),
    outTable: Message('table'),
    optSeparator: 'semicolon',
    optOffset: Custom('0')
  });
  f.node('fc475a', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('7c94b8', 0, 'f032d2', 0);
  f.edge('7c94b8', 0, 'f032d2', 2);
  f.edge('8c6167', 0, 'f032d2', 1);
  f.edge('33a572', 0, 'f032d2', 0);
  f.edge('7c94b8', 0, 'fc475a', 0);
  f.edge('8c6167', 0, 'fc475a', 0);
});
