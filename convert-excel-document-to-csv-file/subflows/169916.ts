import { subflow, Message } from '@robomotion/sdk';

subflow.create('Write CSV', (f) => {
  f.node('aaebf1', 'Core.Flow.Begin', 'Begin', {})
    .then('4edc04', 'Core.FileSystem.PathExists', 'Path Exists', {})
    .then('7dcc4e', 'Core.Programming.Switch', 'Check if exists', { optConditions: [{ scope: 'Custom', name: '' }, { scope: 'Custom', name: '!msg.exists' }] });
  f.node('5c9af4', 'Core.FileSystem.Create', 'Create CSV File', {});
  f.node('fe05df', 'Core.Programming.Switch', 'Separator check', { optConditions: [{ scope: 'Custom', name: '' }, { scope: 'Custom', name: '' }, { scope: 'Custom', name: 'msg.separator !== \',\' && msg.separator !== \';\'' }] });
  f.node('fb2e58', 'Core.CSV.WriteCSV', 'Write CSV', { inFilePath: Message('csv_path') });
  f.node('f01ddd', 'Core.CSV.WriteCSV', 'Write CSV', { inFilePath: Message('csv_path') });
  f.node('f6b095', 'Core.Flow.End', 'End', {});

  f.edge('7dcc4e', 1, '5c9af4', 0);
  f.edge('7dcc4e', 0, 'fe05df', 0);
  f.edge('5c9af4', 0, 'fe05df', 0);
  f.edge('fe05df', 0, 'f01ddd', 0);
  f.edge('fe05df', 1, 'fb2e58', 0);
  f.edge('fe05df', 2, 'f01ddd', 0);
  f.edge('fb2e58', 0, 'f6b095', 0);
  f.edge('f01ddd', 0, 'f6b095', 0);
});