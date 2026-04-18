import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Navigation Menu', (f) => {
  f.node('b24001', 'Core.Flow.Begin', 'Begin', {})
    .then('b24002', 'Core.Programming.Function', 'Label This Test', {
      func: `msg.subflow_name = 'Verify navigation within the Navigation Menu'; return msg;`,
    })
    .then('b24003', 'Robomotion.WindowsAutomation.SendKey', 'Send Alt+2', {
      inSelector: Custom('//Window[contains(@Name,"Calculator")]'),
      optKeyModifier1: '{Alt}',
      optText: Custom('2'),
      optWaitTimeout: 10,
    })
    .then('b24004', 'Core.Programming.Function', 'Build Pass Row', {
      func: `var appBuild = msg.app_name + ' ' + String(msg.product_version || '').trim(); msg.csv_line = [msg.subflow_name, msg.pass_label, 'None', appBuild, msg.os_build].join(',') + '\\n'; return msg;`,
    })
    .then('b24005', 'Core.FileSystem.WriteFile', 'Append Pass Row', {
      inPath: Message('temp_report_file_name'),
      inText: Message('csv_line'),
      optBase64: false,
      optMode: 'append',
      continueOnError: true,
    })
    .then('b24006', 'Core.Flow.End', 'End', { sfPort: 0 });
});
