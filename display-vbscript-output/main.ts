import { flow, Message, Custom } from '@robomotion/sdk';

const inlineVbscript = [
  'Dim name',
  'name = "Robomotion for Desktop!"',
  'WScript.Echo "Hello, " & name',
].join('\r\n');

const myFlow = flow.create('859c38a1-c104-4dc2-b547-8b271b497584', 'Imported Display VBScript Output', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Display VBScript Output\n\nExecutes a VBScript snippet and displays its output. Useful when integrating with legacy Windows tooling.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10002', 'Core.Programming.Function', 'Build Script', {
      func: `msg.vbs_script = ${JSON.stringify(inlineVbscript)}; var tmp = global.get('$TempDir$') || 'C:/Windows/Temp'; msg.vbs_path = tmp + '/robomotion_inline_' + Date.now() + '.vbs'; msg.vbs_args = ['//Nologo', msg.vbs_path]; return msg;`,
    })
    .then('a10003', 'Core.FileSystem.WriteFile', 'Write Temp VBS', {
      inPath: Message('vbs_path'),
      inText: Message('vbs_script'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10004', 'Core.Process.StartProcess', 'Run VBScript', {
      inFilePath: Custom('cscript'),
      inArguments: Message('vbs_args'),
      optBackground: false,
      outStdout: Message('vbscript_output'),
    })
    .then('a10005', 'Core.FileSystem.Delete', 'Delete Temp VBS', {
      inPath: Message('vbs_path'),
      continueOnError: true,
    })
    .then('a10006', 'Core.Programming.Function', 'Trim Output', {
      func: `var s = String(msg.vbscript_output || ''); while (s.length && (s.charCodeAt(s.length - 1) === 10 || s.charCodeAt(s.length - 1) === 13)) s = s.slice(0, -1); msg.vbscript_output = s; return msg;`,
    })
    .then('a10007', 'Core.Dialog.MessageBox', 'Show Output', {
      inTitle: Custom('Output from VBScript:'),
      inText: Message('vbscript_output'),
      optType: 'info',
    })
    .then('a10008', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
