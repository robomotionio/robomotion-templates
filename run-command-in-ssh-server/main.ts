import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('611b7419-9f08-46f8-8953-b6a0946a0db0', 'Run Command In SSH Server', (f) => {
  f.node('70d181', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Run Command In SSH Server\n\nThis template is connected to ssh server, and executes specified commands\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.host field with the host address of your ssh server.\n\n**3.** Update msg.port field with the port of your ssh server. (Default 22)\n\n**4.** Update msg.command field with the command you want to execute.\n\n**5.** Install SSH package to designer. You can examine [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration#adding-slack-package-to-designer) document for installing SSH package.\n\n**6.** Set connection credentials. \n\nIf you want to connect with your username and password set your credentials in Connect node. You can do it by following [this](https://docs.robomotion.io/flow-designer/vaults) document\n\nIf  you want to connect with your private key, update msg.private_key_path with the full path of your ssh private key. You also need to add your username as credentials in Connect node. You can examine [this](https://docs.robomotion.io/flow-designer/vaults)  document. You should create a Login Item and just provide the username, no need to password\n        \n'
  });
  f.node('c8391e', 'Core.Trigger.Inject', 'Inject', {})
    .then('291521', 'Core.Programming.Function', 'Config', {
    func: 'msg.host = ""; //[Required] The host address of the server\nmsg.port = 22 //[Required] The port of the server. SSH default port is 22\nmsg.command = "ls" //[Requeired] The command that you want to execute in server\n\nmsg.private_key_path = "" //[Optional] If you want to connect to the ssh server with your private key, you should provide\n//it. Othwerwise you should provide your credentials\nreturn msg;'
  })
    .then('1680c1', 'Robomotion.SSH.Connect', 'Connect', {
    inHost: Message('host'),
    inPKPath: Message('private_key_path'),
    inPort: Custom('22'),
    outClientID: Message('client_id'),
    optCredentials: Credential({ vaultId: '85431c47-21a2-464f-bf2c-0a7bc3e0908f', itemId: '5da33320-e62e-43bc-9fe0-8c59f7409785' }),
    optTimeout: Custom('30')
  })
    .then('d593f1', 'Robomotion.SSH.RunCommand', 'Run Command', {
    inClientID: Message('client_id'),
    inCommand: Message('command'),
    outResult: Message('result')
  })
    .then('2a658a', 'Robomotion.SSH.Disconnect', 'Disconnect', { inClientID: Message('client_id') })
    .then('0931b3', 'Core.Programming.Function', 'Prepare Message', {
    func: 'msg.message = "Command: " + msg.command + "\\nResult: " + msg.result;\nreturn msg;'
  })
    .then('bbc514', 'Core.Dialog.MessageBox', 'Show Message', {
    inText: Message('message'),
    inTitle: Custom('Command Executed')
  })
    .then('528036', 'Core.Flow.Stop', 'Stop', {});
}).start();
