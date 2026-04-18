import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Set Variables', (f) => {
  f.node('b20001', 'Core.Flow.Begin', 'Begin', {})
    .then('b20002', 'Core.Process.StartProcess', 'Read OS Build', {
      inFilePath: Custom('powershell'),
      inCustomArgs: ['-NoProfile', '-Command', '(Get-CimInstance Win32_OperatingSystem).BuildNumber'],
      optBackground: false,
      outStdout: Message('os_build_raw'),
    })
    .then('b20003', 'Robomotion.DateTime.Now', 'Get Now', {
      optLayout: 'RFC3339',
      optTimezoneOffset: 'Local',
      outNow: Message('now'),
    })
    .then('b20004', 'Robomotion.DateTime.Format', 'Format Stamp', {
      inTime: Message('now'),
      optInLayout: 'RFC3339',
      optOutLayout: 'Custom',
      optCustomOutLayout: Custom('20060102_0304'),
      outFormattedTime: Message('formatted_date_time'),
    })
    .then('b20005', 'Core.Programming.Function', 'Compose Paths', {
      func: `var docs = global.get('$Home$') + '/Documents'; msg.app_name = 'Calculator'; msg.subflow_name = 'Main'; msg.fail_label = 'Fail'; msg.pass_label = 'Pass'; msg.special_folder_path = docs; msg.os_build = String(msg.os_build_raw || '').trim(); msg.temp_report_file_name = docs + '/TestReport_DemoGUIAutomationTestPass.csv'; msg.report_file_name = docs + '/TestReport_DemoGUIAutomationTestPass_' + msg.formatted_date_time + '.csv'; return msg;`,
    })
    .then('b20006', 'Core.Flow.End', 'End', { sfPort: 0 });
});
