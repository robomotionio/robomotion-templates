import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('1cf8d4a9-a99c-4020-a331-cfa530f029b5', 'Imported Password Generator', (f) => {
  f.node('523849', 'Core.Flow.Comment', 'Comment', { optText: '# Password Generator How-To\n\nThis template generates a strong password with the specified length and automatically copies it to your clipboard.\n\n## Usage Steps\n\n### 1. Edit the Config Node\n\nClick on the Config Node to open the settings panel. This node contains the basic configuration settings for the password generation process.\n\n### 2. Set the Password Length\n\nUpdate the `msg.passwordLength` variable. Enter your desired password length (number of characters) into this variable. For example: you can specify a number like 12, 16, or 20.\n\n## Result\n\nWhen the template is executed, a strong password with your specified length will be generated and automatically copied to your clipboard. You can then paste it wherever you need (browser, application, etc.).' });
  f.node('d661e2', 'Core.Trigger.Inject', 'Start', {})
    .then('8f2ba9', 'Core.Programming.Function', 'config', { func: 'msg.passwordLength = 16 //[Required] length of the password you want to generate\nreturn msg;' })
    .then('a06b40', 'Core.Programming.Function', 'Generate Password', { func: 'charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",\nmsg.password = "";\n    \nfor (var i = 0, n = charset.length; i < msg.passwordLength ; ++i) {\n    msg.password += charset.charAt(Math.floor(Math.random() * n));\n}\nreturn msg;' })
    .then('e03bcd', 'Core.Clipboard.Set', 'Set Password To Clipboard', { inText: Message('password') })
    .then('f9918f', 'Core.Dialog.MessageBox', 'Show Password', { inTitle: Custom('Generated Password:'), inText: Message('password') })
    .then('880e4c', 'Core.Flow.Stop', 'Stop', {});
}).start();