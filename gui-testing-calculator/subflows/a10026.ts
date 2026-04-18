import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Log Errors', (f) => {
  f.node('b26001', 'Core.Flow.Begin', 'Begin', {})
    .then('b26002', 'Core.Programming.Function', 'Build Fail Row', {
      func: `var appBuild = msg.app_name + ' ' + String(msg.product_version || '').trim(); var errText = (msg.error && (msg.error.message || msg.error.text)) ? (msg.error.message || msg.error.text) : String(msg.error || 'Unknown error'); msg.csv_line = [msg.subflow_name || 'Unknown', msg.fail_label, errText.replace(/,/g, ';'), appBuild, msg.os_build].join(',') + '\\n'; return msg;`,
    })
    .then('b26003', 'Core.FileSystem.WriteFile', 'Append Fail Row', {
      inPath: Message('temp_report_file_name'),
      inText: Message('csv_line'),
      optBase64: false,
      optMode: 'append',
      continueOnError: true,
    })
    .then('b26004', 'Core.Flow.End', 'End', { sfPort: 0 });
});
