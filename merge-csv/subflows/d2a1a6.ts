import { subflow, Message } from '@robomotion/sdk';

subflow.create('Merge CSV', (f) => {
  f.node('45de0f', 'Core.Flow.Begin', 'Begin', {})
    .then('ddc3b7', 'Core.CSV.WriteCSV', 'Write CSV', { inFilePath: Message('csv_path') })
    .then('508cd7', 'Core.Flow.End', 'End', {});
});