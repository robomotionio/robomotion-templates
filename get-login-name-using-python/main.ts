import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('c89dcd58-3c35-47b8-8d1c-9107ed5ff752', 'Imported Get Login Name Using Python', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get Login Name Using Python\n\nRetrieves the current Windows login user via an inline Python script. Handy for audit trails or user-scoped paths.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Process.StartProcess', 'Get Login Name', {
      inFilePath: Custom('powershell'),
      inCustomArgs: ['-NoProfile', '-Command', '$env:USERNAME'],
      optBackground: false,
      outStdout: Message('login_name_raw'),
    })
    .then('a10003', 'Core.Programming.Function', 'Build Dialog Text', {
      func: `var user = String(msg.login_name_raw || ''); while (user.length && (user.charCodeAt(user.length - 1) === 10 || user.charCodeAt(user.length - 1) === 13)) user = user.slice(0, -1); msg.dialog_text = 'Machine login name: ' + user; return msg;`,
    })
    .then('a10004', 'Core.Dialog.MessageBox', 'Show Output', {
      inTitle: Custom('Login name'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('a10005', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
