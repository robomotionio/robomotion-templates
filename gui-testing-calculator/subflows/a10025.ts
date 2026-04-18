import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Close App', (f) => {
  f.node('b25001', 'Core.Flow.Begin', 'Begin', {})
    .then('b25002', 'Core.Programming.Function', 'Label This Test', {
      func: `msg.subflow_name = 'Verify the application can be closed';
return msg;`,
    })
    .then('b25003', 'Robomotion.WindowsAutomation.CloseWindow', 'Close Calculator', {
      inSelector: Custom('//Window[contains(@Name,"Calculator")]'),
    })
    .then('b25004', 'Core.Programming.Function', 'Build Pass Row', {
      func: `var appBuild = msg.app_name + ' ' + String(msg.product_version || '').trim();
msg.csv_line = [msg.subflow_name, msg.pass_label, 'None', appBuild, msg.os_build].join(',') + '\\n';
return msg;`,
    })
    .then('b25005', 'Core.FileSystem.WriteFile', 'Append Pass Row', {
      inPath: Message('temp_report_file_name'),
      inText: Message('csv_line'),
      optBase64: false,
      optMode: 'append',
      continueOnError: true,
    })
    .then('b25006', 'Core.Flow.End', 'End', { sfPort: 0 });
});
