import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Launch App', (f) => {
  f.node('b22001', 'Core.Flow.Begin', 'Begin', {})
    .then('b22002', 'Core.Programming.Function', 'Label This Test', {
      func: `msg.subflow_name = 'Verify the application can be launched'; return msg;`,
    })
    .then('b22003', 'Core.Process.StartProcess', 'Start Calculator', {
      inFilePath: Custom('calc.exe'),
      optBackground: true,
    })
    .then('b22004', 'Robomotion.WindowsAutomation.WaitWindow', 'Wait For Calculator', {
      inSelector: Custom('//Window[contains(@Name,"Calculator")]'),
      optCondition: 'appear',
      optTimeout: 15,
    })
    .then('b22005', 'Core.Process.StartProcess', 'Read Calculator Version', {
      inFilePath: Custom('powershell'),
      inCustomArgs: [
        '-NoProfile',
        '-Command',
        'Get-Process CalculatorApp,Calculator -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty ProductVersion',
      ],
      optBackground: false,
      outStdout: Message('product_version'),
      continueOnError: true,
    })
    .then('b22006', 'Core.Programming.Function', 'Build Pass Row', {
      func: `var appBuild = msg.app_name + ' ' + String(msg.product_version || '').trim(); msg.csv_line = [msg.subflow_name, msg.pass_label, 'None', appBuild, msg.os_build].join(',') + '\\n'; return msg;`,
    })
    .then('b22007', 'Core.FileSystem.WriteFile', 'Append Pass Row', {
      inPath: Message('temp_report_file_name'),
      inText: Message('csv_line'),
      optBase64: false,
      optMode: 'append',
      continueOnError: true,
    })
    .then('b22008', 'Core.Flow.End', 'End', { sfPort: 0 });
});
