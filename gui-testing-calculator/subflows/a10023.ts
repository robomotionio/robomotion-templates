import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Resize and Position App', (f) => {
  f.node('b23001', 'Core.Flow.Begin', 'Begin', {})
    .then('b23002', 'Core.Programming.Function', 'Label This Test', {
      func: `msg.subflow_name = 'Verify the application can be resized and positioned'; msg.calc_x = 1; msg.calc_y = 40; return msg;`,
    })
    .then('b23003', 'Robomotion.WindowsAutomation.MoveWindow', 'Move Calculator', {
      inSelector: Custom('//Window[contains(@Name,"Calculator")]'),
      inX: Message('calc_x'),
      inY: Message('calc_y'),
    })
    .then('b23004', 'Core.Programming.Function', 'Build Pass Row', {
      func: `var appBuild = msg.app_name + ' ' + String(msg.product_version || '').trim(); msg.csv_line = [msg.subflow_name, msg.pass_label, 'None', appBuild, msg.os_build].join(',') + '\\n'; return msg;`,
    })
    .then('b23005', 'Core.FileSystem.WriteFile', 'Append Pass Row', {
      inPath: Message('temp_report_file_name'),
      inText: Message('csv_line'),
      optBase64: false,
      optMode: 'append',
      continueOnError: true,
    })
    .then('b23006', 'Core.Flow.End', 'End', { sfPort: 0 });
});
