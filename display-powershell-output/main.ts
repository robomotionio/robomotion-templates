import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('3e677d4f-f651-41f3-a2f4-0f40ffd9bb97', 'Imported Display PowerShell Output', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Display PowerShell Output\n\nRuns a PowerShell script and displays the captured standard output in a dialog.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Process.StartProcess', 'Run PowerShell Script', {
      inFilePath: Custom('powershell'),
      inCustomArgs: ['-NoProfile', '-Command', '$variableName = "Hello World!"; Write-Output $variableName'],
      optBackground: false,
      outStdout: Message('powershell_output'),
    })
    .then('a10003', 'Core.Programming.Function', 'Trim Output', {
      func: `var s = String(msg.powershell_output || ''); while (s.length && (s.charCodeAt(s.length - 1) === 10 || s.charCodeAt(s.length - 1) === 13)) s = s.slice(0, -1); msg.powershell_output = s; return msg;`,
    })
    .then('a10004', 'Core.Dialog.MessageBox', 'Show Output', {
      inTitle: Custom('Output from PowerShell script:'),
      inText: Message('powershell_output'),
      optType: 'info',
    })
    .then('a10005', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
