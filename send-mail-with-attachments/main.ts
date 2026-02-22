import { flow, Credential, Message } from '@robomotion/sdk';

flow.create('a1864ffa-772f-4758-b0d8-34895b14dafd', 'Send Mail With Attachments', (f) => {
  f.node('5c271b', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Send Mail With Attachments How-To \n\nThis template uses *Mail* nodes to send e-mail with attachments.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.from, msg.to, msg.cc, msg.bcc fields with the emails you want to test.\n\n**3.** Update msg.subject with the subject of the mail you want to send.\n\n**4.** Update msg.body field with the body of the mail you want to send.\n\n**5** Update msg.attachments field with the full paths of the files you want to attach to the email you want to send.\n\n**6.** Apply the mail configuration by using this [instructions](https://docs.robomotion.io/getting-started/tutorials/mail)\n\n**7.** Select your vault and item in the credentials field of the **Send Mail** node'
  });
  f.node('08de9a', 'Core.Trigger.Inject', 'Start', {})
    .then('78a57a', 'Core.Programming.Function', 'Config', {
    func: 'msg.from = "support@robomotion.io"; // [Required] The excel that includes birthdays of the employees\nmsg.to = "to1@gmail.com, to2@hotmail.com" //[Required] You can split e-mail addresses with comma\nmsg.cc = "cc1@gmail.com, cc2@gmail.com" //[Optional] You can split e-mail addresses with comma\nmsg.bcc = \'bcc1@gmail.com,bcc2@gmail.com\'; // [Optional] You can split e-mail addresses with comma\nmsg.subject = "Template From Robomotion"; //[Required] Subject of the mail\nmsg.body = "You received your template mail succesfully"; // [Required] Body of the mail\nmsg.attachments = ["C:\\\\file1.txt", "C:\\\\file2.pdf"] //[Optional] the paths of attachment files\nreturn msg;'
  })
    .then('10cbc0', 'Core.Mail.Send', 'Send Mail', {
    inFrom: Message('from'),
    inTo: Message('to'),
    inCc: Message('cc'),
    inBcc: Message('bcc'),
    inReplyTo: Message('replyTo'),
    inSubject: Message('subject'),
    inBody: Message('body'),
    optCredentials: Credential({ vaultId: '85431c47-21a2-464f-bf2c-0a7bc3e0908f', itemId: 'db4ed81a-e4b2-496e-8d65-de875e50f3ef' }),
    optHtmlBody: false,
    optAttachments: Message('attachments')
  })
    .then('620982', 'Core.Flow.Stop', 'Stop', {});
}).start();
