import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('f0852401-e4fc-4766-ab4f-e79bb164ca71', 'Run Process', (f) => {
  f.node('9d8099', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Run Process \n\nThis template runs an executable file which is (curl), and shows the standart output of the process (which is IP address of the user ) in message box\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** If you do not have curl, you should download from [here](https://curl.se/download.html)\n\n**3.** Update msg.executable_path field with the path of the executable file you downloaded.\n'
  });
  f.node('93e489', 'Core.Trigger.Inject', 'Inject', {})
    .then('40f6c1', 'Core.Programming.Function', 'Config', {
    func: 'msg.executable_path = "C:\\\\Windows\\\\System32\\\\curl.exe"; //[Required] The full path of the executable file\nmsg.args = ["ifconfig.me"]; //[Optional] Arguments of the executable file. If you try another executable, you can add or remove what you need\nreturn msg;'
  })
    .then('85c60a', 'Core.Application.StartProcess', 'Start Process', {
    inFilePath: Message('executable_path'),
    inArguments: Message('args'),
    outPid: Message('pid'),
    outStdout: Message('stdout')
  })
    .then('e0ef3c', 'Core.Programming.Function', 'Prepare Message', {
    func: 'msg.message = "The output of the finished process is: \\n" + msg.stdout;\nreturn msg;'
  })
    .then('5a96a6', 'Core.Dialog.MessageBox', 'Show Message', {
    inText: Message('message'),
    inTitle: Custom('Process Finished')
  })
    .then('efda31', 'Core.Flow.Stop', 'Stop', {});
}).start();
