import { flow, Message } from '@robomotion/sdk';

flow.create('c5cd59d6-77e2-45d9-8eb6-1cd98ae2766f', 'Start Process', (f) => {
  f.node('f12856', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Start Process How-To \n\nThis template uses *Process* nodes to run a process existing in your computer.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.path field to the full filepath of the process you want to\nexecute.\n\n**3.** Set the msg.args array to the list of arguments you want to pass to the\nprocess on execution. [Optional]'
  });
  f.node('90fdb6', 'Core.Trigger.Inject', 'Inject', {})
    .then('bc03c8', 'Core.Programming.Function', 'Config', {
    func: '// Process path for Windows users.\nmsg.path = "C:\\\\Windows\\\\system32\\\\calc.exe";\n\n// Process path for Linux users.\n// msg.path = "";\n\n// Process path for Mac users.\n// msg.path = "";\n\n// Optional process arguments\nmsg.args = [];\n\nreturn msg;'
  })
    .then('82512d', 'Core.Application.StartProcess', 'Start Process', {
    inFilePath: Message('path'),
    inArguments: Message('args'),
    outPid: Message('pid'),
    outStdout: Message('stdout')
  })
    .then('7b8970', 'Core.Flow.Stop', 'Stop', {});
}).start();
