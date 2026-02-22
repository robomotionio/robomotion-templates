import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('84776429-d7e0-4616-9878-91ce0113d704', 'Upload File To SSH Server', (f) => {
  f.node('37c41f', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Upload File To SSH Server\n\nThis template uploads file to ssh server\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.host field with the host address of your ssh server.\n\n**3.** Update msg.port field with the port of your ssh server. (Default 22)\n\n**4.** Update msg.local_file_path field with the path of the file you want to upload.\n\n**5.** Update msg.remote_file_path field with the ssh path you want to upload\n\n**6.** Install SSH package to designer. You can examine [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration#adding-slack-package-to-designer) document for installing SSH package.\n\n**7.** Set connection credentials. \n\nIf you want to connect with your username and password set your credentials in Connect node. You can do it by following [this](https://docs.robomotion.io/flow-designer/vaults) document\n\nIf  you want to connect with your private key, update msg.private_key_path with the full path of your ssh private key. You also need to add your username as credentials in Connect node. You can examine [this](https://docs.robomotion.io/flow-designer/vaults)  document. You should create a Login Item and just provide the username, no need to password\n        \n'
  });
  f.node('f7263c', 'Core.Trigger.Inject', 'Inject', {})
    .then('afa430', 'Core.Programming.Function', 'Config', {
    func: 'msg.host = ""; //[Required] The host address of the server\nmsg.port = 22 //[Required] The port of the server. SSH default port is 22\nmsg.local_file_path = "" //[Required] The path of the file you want to upload\nmsg.remote_file_path = "" //[Required] The destination path that you want to upload\n\nmsg.private_key_path = "" //[Optional] If you want to connect to the ssh server with your private key, you should provide\n//it. Othwerwise you should provide your credentials\nreturn msg;'
  })
    .then('9222d5', 'Robomotion.SSH.Connect', 'Connect', {
    inHost: Message('host'),
    inPKPath: Message('private_key_path'),
    inPort: Custom('22'),
    outClientID: Message('client_id'),
    optCredentials: Credential({ vaultId: '85431c47-21a2-464f-bf2c-0a7bc3e0908f', itemId: '5da33320-e62e-43bc-9fe0-8c59f7409785' }),
    optTimeout: Custom('30')
  })
    .then('e6f91e', 'Robomotion.SSH.UploadFile', 'Upload File', {
    inClientID: Message('client_id'),
    inLocalPath: Message('local_file_path'),
    inRemotePath: Message('remote_file_path')
  })
    .then('258c34', 'Robomotion.SSH.RunCommand', 'Run Command', {
    inClientID: Message('client_id'),
    inCommand: Custom('ls'),
    outResult: Message('result')
  })
    .then('a818e5', 'Robomotion.SSH.Disconnect', 'Disconnect', { inClientID: Message('client_id') })
    .then('d1b415', 'Core.Programming.Function', 'Prepare Message', {
    func: 'msg.message = "List of files in ssh: \\n" + msg.result;\nreturn msg;'
  })
    .then('21ed69', 'Core.Dialog.MessageBox', 'Show Message', {
    inText: Message('message'),
    inTitle: Custom('File Uploaded')
  })
    .then('e4ad9b', 'Core.Flow.Stop', 'Stop', {});
}).start();
