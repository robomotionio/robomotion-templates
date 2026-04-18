import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('80648b70-905d-4588-ac4d-e093699cde22', 'Imported Print Current Week\'s Calendar', (f) => {
  f.addDependency('Robomotion.WindowsAutomation', '0.18.1');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Print Current Week\'s Calendar\n\nGenerates an HTML page for the current week and sends it to the default printer. Useful for team dashboards or physical planning boards.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Build Paths', {
      func: `msg.desktop_folder = global.get('$Home$') + '/Desktop';
msg.image_path = msg.desktop_folder + '/calendar.jpg';
return msg;`,
    })
    .then('a10003', 'Core.Process.StartProcess', 'Launch Outlook', {
      inFilePath: Custom('C:/Program Files/Microsoft Office/root/Office16/OUTLOOK.EXE'),
      optBackground: true,
      outPid: Message('outlook_pid'),
    })
    .then('a10004', 'Robomotion.WindowsAutomation.WaitWindow', 'Wait For Outlook', {
      inSelector: Custom('//Window[contains(@Name,"Outlook")]'),
      optCondition: 'appear',
      optTimeout: 60,
    })
    .then('a10005', 'Robomotion.WindowsAutomation.SendKey', 'Switch To Calendar', {
      inSelector: Custom('//Window[contains(@Name,"Outlook")]'),
      optKeyModifier1: '{Ctrl}',
      optText: Custom('2'),
      optWaitTimeout: 10,
    })
    .then('a10006', 'Robomotion.WindowsAutomation.SendKey', 'Switch To Work Week View', {
      inSelector: Custom('//Window[contains(@Name,"Outlook")]'),
      optKeyModifier1: '{Ctrl}',
      optKeyModifier2: '{Alt}',
      optText: Custom('2'),
      optWaitTimeout: 10,
      continueOnError: true,
    })
    .then('a10007', 'Core.Programming.Sleep', 'Wait For Repaint', {
      optDuration: Custom('2'),
    })
    .then('a10008', 'Robomotion.WindowsAutomation.Screenshot', 'Capture Window', {
      inSelector: Custom('//Window[contains(@Name,"Outlook")]'),
      inFilePath: Message('image_path'),
      optFullScreen: false,
      optWaitTimeout: 10,
    })
    .then('a10009', 'Core.Programming.Function', 'Build Print Args', {
      func: `msg.print_args = ['-NoProfile', '-Command', 'Start-Process -FilePath ' + JSON.stringify(msg.image_path) + ' -Verb Print'];
return msg;`,
    })
    .then('a10010', 'Core.Process.StartProcess', 'Send To Printer', {
      inFilePath: Custom('powershell'),
      inArguments: Message('print_args'),
      optBackground: true,
      continueOnError: true,
    })
    .then('a10011', 'Core.Programming.Sleep', 'Wait Print Spool', {
      optDuration: Custom('4'),
    })
    .then('a10012', 'Core.FileSystem.Delete', 'Delete Screenshot', {
      inPath: Message('image_path'),
      continueOnError: true,
    })
    .then('a10013', 'Core.Programming.Function', 'Build Kill Args', {
      func: `msg.kill_args = ['/F', '/IM', 'outlook.exe'];
return msg;`,
    })
    .then('a10014', 'Core.Process.StartProcess', 'Close Outlook', {
      inFilePath: Custom('taskkill'),
      inArguments: Message('kill_args'),
      optBackground: true,
      continueOnError: true,
    })
    .then('a10099', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
