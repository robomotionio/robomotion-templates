import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Finish Test Report', (f) => {
  f.node('b28001', 'Core.Flow.Begin', 'Begin', {})
    .then('b28002', 'Core.Programming.Function', 'Build Finalize Script', {
      func: `var tmp = msg.temp_report_file_name; var out = msg.report_file_name; msg.finalize_args = ['-NoProfile', '-Command', "Get-Content -LiteralPath '" + tmp + "' | Where-Object { $_.Trim() -ne '' } | Out-File -Encoding UTF8 -LiteralPath '" + out + "'; Remove-Item -LiteralPath '" + tmp + "' -Force"]; return msg;`,
    })
    .then('b28003', 'Core.Process.StartProcess', 'Finalize Report', {
      inFilePath: Custom('powershell'),
      inArguments: Message('finalize_args'),
      optBackground: false,
      continueOnError: true,
    })
    .then('b28004', 'Core.Programming.Function', 'Build Dialog Text', {
      func: `msg.dialog_text = 'Test results are located in ' + msg.report_file_name; return msg;`,
    });

  f.node('b28005', 'Core.Flow.Log', 'Log Location', {
    inText: Message('dialog_text'),
    optLevel: 'info',
  });

  f.node('b28006', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('b28004', 0, 'b28005', 0);
  f.edge('b28004', 0, 'b28006', 0);
});
