import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('a0323ea8-7ba5-4e3a-bf0f-806a96ebc077', 'Get Instagram Stories', (f) => {
  f.node('8289c4', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Instagram Get Stories How-To \n\nThis template lists the instagram stories of multiple accounts, and downloads them to specified folder\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.stories_path field with the path of folder that the stories will be downloaded\n\n**3.** Install Instagram package like [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration#adding-slack-package-to-designer) example\n\n**4.** Create a vault item. You can examine a sample vault creation from [here](https://docs.robomotion.io/flow-designer/vaults#using-vault-items)\n\n**5.** Set credentials to your vault item in Login node\n'
  });
  f.node('49a2b3', 'Core.Trigger.Inject', 'Start', {})
    .then('e3911b', 'Core.Programming.Function', 'Config', {
    func: '// Set download path for the stories\nmsg.stories_path = "C:\\\\"; //[Required] The path of the folder that the stories will be saved\nmsg.profiles = [ "marvel", "neymarjr" ] //[Requeired] The name of the instagram accounts. You can add new accounts as many as you want\n\nreturn msg;\n'
  })
    .then('782a59', 'Robomotion.Instagram.Login', 'Login', {
    outMessage: Message('instagram_id'),
    optCredentials: Credential({ vaultId: '85431c47-21a2-464f-bf2c-0a7bc3e0908f', itemId: 'dc950670-7021-4868-8f69-39a72a30d55a' })
  });
  f.node('a6188e', 'Core.Flow.Label', 'Next Profile', {});
  f.node('c5c77e', 'Core.Programming.ForEach', 'For Each Profile', {
    outputs: 2,
    optInput: Message('profiles'),
    optOutput: Message('profile')
  });
  f.node('f44443', 'Core.Flow.Stop', 'Stop', {});
  f.node('83ab2f', 'Core.Dialog.MessageBox', 'Show Info ', {
    inText: Message('message'),
    inTitle: Custom('Flow Finished')
  });
  f.node('1b7487', 'Core.Programming.Function', 'Prepare Message', {
    func: 'msg.message = "Your stories downloaded to " + msg.stories_path;\nreturn msg;'
  });
  f.node('6b2c42', 'Core.Flow.SubFlow', 'Get Stories', { subflow: '4b548f83-706e-4852-8268-099342a3fa31' })
    .then('74a047', 'Core.Flow.GoTo', 'Go To Next Profile', { optNodes: { ids: ['a6188e'], type: 'goto', all: false } });

  f.edge('782a59', 0, 'c5c77e', 0);
  f.edge('c5c77e', 0, '6b2c42', 0);
  f.edge('c5c77e', 1, '1b7487', 0);
  f.edge('a6188e', 0, 'c5c77e', 0);
  f.edge('83ab2f', 0, 'f44443', 0);
  f.edge('1b7487', 0, '83ab2f', 0);
}).start();
