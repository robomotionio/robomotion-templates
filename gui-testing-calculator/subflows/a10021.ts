import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Start Test Report', (f) => {
  f.node('b21001', 'Core.Flow.Begin', 'Begin', {})
    .then('b21002', 'Core.FileSystem.Delete', 'Remove Old Temp', {
      inPath: Message('temp_report_file_name'),
      continueOnError: true,
    })
    .then('b21003', 'Core.Programming.Function', 'Build Header', {
      func: `msg.csv_line = 'Test,Outcome,Error,App Build,OS Build\\n';
return msg;`,
    })
    .then('b21004', 'Core.FileSystem.WriteFile', 'Write Header', {
      inPath: Message('temp_report_file_name'),
      inText: Message('csv_line'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('b21005', 'Core.Flow.End', 'End', { sfPort: 0 });
});
