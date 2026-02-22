import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('92810309-9cae-4944-8c55-4525902a81b8', 'Get Instagram Highlights', (f) => {
  f.node('58c603', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Instagram Get Highlights How-To \n\nThis template lists the instagram highlights of multiple accounts, and downloads them to specified folder\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Install Instagram package. You can examine a sample package installation from [here](https://docs.robomotion.io/getting-started/tutorials/slack-integration#adding-slack-package-to-designer)\n\n**3.** Update msg.root_path field with the path of the folder that the highlights will be saved.\n\n**4.** Update msg.os_splitter field  with the path splitter of your operating system. If your OS is Windows it is "\\\\", in Linux or MacOS it is "/"\n'
  });
  f.node('68ffcd', 'Core.Trigger.Inject', 'Start', {})
    .then('19cd06', 'Core.Programming.Function', 'Config', {
    func: '// Set download path for the stories\nmsg.root_path = "C:\\\\"; //[Required] The path of the folder that the stories will be saved\nmsg.profiles = [ "neymarjr" ] //[Required] The name of the instagram accounts. You can add new accounts as many as you want\nmsg.os_splitter = "\\\\"; //[Required] //The path splitter of your operating system. If you use windows, it is "\\\\", in MacOS or Linux it is "/"\nreturn msg;\n'
  })
    .then('092bcf', 'Robomotion.Instagram.Login', 'Login', {
    outMessage: Message('instagram_id'),
    optCredentials: Credential({ vaultId: '85431c47-21a2-464f-bf2c-0a7bc3e0908f', itemId: 'dc950670-7021-4868-8f69-39a72a30d55a' })
  });
  f.node('6895b4', 'Core.Flow.Label', 'Next Profile', {});
  f.node('1ac5e9', 'Core.Programming.ForEach', 'For Each Profile', {
    outputs: 2,
    optInput: Message('profiles'),
    optOutput: Message('profile')
  });
  f.node('b044f7', 'Core.Flow.Stop', 'Stop', {});
  f.node('cc49db', 'Core.Dialog.MessageBox', 'Show Info ', {
    inText: Message('message'),
    inTitle: Custom('Flow Finished')
  });
  f.node('485512', 'Core.Programming.Function', 'Prepare Message', {
    func: 'msg.message = "Your stories downloaded to " + msg.profile_root;\nreturn msg;'
  });
  f.node('977031', 'Core.Flow.SubFlow', 'Get Highlights', { subflow: 'e1976024-756a-47ce-949e-bb46474dc2e2' })
    .then('fa48cb', 'Core.Flow.GoTo', 'Go To Next Profile', { optNodes: { ids: ['6895b4'], type: 'goto', all: false } });

  f.edge('092bcf', 0, '1ac5e9', 0);
  f.edge('1ac5e9', 0, '977031', 0);
  f.edge('1ac5e9', 1, '485512', 0);
  f.edge('6895b4', 0, '1ac5e9', 0);
  f.edge('cc49db', 0, 'b044f7', 0);
  f.edge('485512', 0, 'cc49db', 0);
}).start();
