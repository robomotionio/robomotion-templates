import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('c80497c1-86bb-4eb9-8647-38ae3c8025e7', 'Download File From SSH Server', (f) => {
  f.node('b8ef42', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Download File From SSH Server\n\nThis template downloads file from ssh server to local computer\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.host field with the host address of your ssh server.\n\n**3.** Update msg.port field with the port of your ssh server. (Default 22)\n\n**4.** Update msg.remote_file_path field with the ssh path you want to download\n\n**5.** Update msg.local_file_path field with the local path of the file you want to download.\n\n**6.** Install SSH package to designer. You can examine [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration#adding-slack-package-to-designer) document for installing SSH package.\n\n**7.** Set connection credentials. \n\nIf you want to connect with your username and password set your credentials in Connect node. You can do it by following [this](https://docs.robomotion.io/flow-designer/vaults) document\n\nIf  you want to connect with your private key, update msg.private_key_path with the full path of your ssh private key. You also need to add your username as credentials in Connect node. You can examine [this](https://docs.robomotion.io/flow-designer/vaults)  document. You should create a Login Item and just provide the username, no need to password\n        \n'
  });
  f.node('f428f0', 'Core.Trigger.Inject', 'Inject', {})
    .then('a0846e', 'Core.Programming.Function', 'Config', {
    func: 'msg.host = ""; //[Required] The host address of the server\nmsg.port = 22 //[Required] The port of the server. SSH default port is 22\nmsg.remote_file_path = "" //[Required] The destination path that you want to upload\nmsg.local_file_path = "" //[Required] The path of the file you want to upload\n\nmsg.private_key_path = "" //[Optional] If you want to connect to the ssh server with your private key, you should provide\n//it. Othwerwise you should provide your credentials\nreturn msg;'
  })
    .then('2d6391', 'Robomotion.SSH.Connect', 'Connect', {
    inHost: Message('host'),
    inPKPath: Message('private_key_path'),
    inPort: Custom('22'),
    outClientID: Message('client_id'),
    optCredentials: Credential({ vaultId: '85431c47-21a2-464f-bf2c-0a7bc3e0908f', itemId: '5da33320-e62e-43bc-9fe0-8c59f7409785' }),
    optTimeout: Custom('30')
  })
    .then('44910f', 'Robomotion.SSH.DownloadFile', 'Download File', {
    inClientID: Message('client_id'),
    inLocalPath: Message('local_file_path'),
    inRemotePath: Message('remote_file_path')
  })
    .then('7bf58c', 'Robomotion.SSH.Disconnect', 'Disconnect', { inClientID: Message('client_id') })
    .then('f22ca7', 'Core.Flow.Stop', 'Stop', {});
}).start();
