import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('3c30aadc-6811-4605-a07e-eaeb677f3902', 'Send Mail As HTML', (f) => {
  f.node('769805', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Send Mail With Attachments How-To \n\nThis template uses *Mail* nodes to send e-mail as html.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.from, msg.to, msg.cc, msg.bcc fields with the emails you want to test.\n\n**3.** Update msg.subject with the subject of the mail you want to send.\n\n**4.** Apply the mail configuration by using this [instructions](https://docs.robomotion.io/getting-started/tutorials/mail)\n\n**5.** Select your vault and item in the credentials field of the **Send Mail** node'
  });
  f.node('007ab9', 'Core.Trigger.Inject', 'Start', {})
    .then('12b5c1', 'Core.Programming.Function', 'Config', {
    func: 'msg.from = "support@robomotion.io"; // [Required] The excel that includes birthdays of the employees\nmsg.to = "to1@gmail.com, to2@hotmail.com" //[Required] You can split e-mail addresses with comma\nmsg.cc = "cc1@gmail.com, cc2@gmail.com" //[Optional] You can split e-mail addresses with comma\nmsg.bcc = \'bcc1@gmail.com,bcc2@gmail.com\'; // [Optional] You can split e-mail addresses with comma\nmsg.subject = "Template From Robomotion"; //[Required] Subject of the mail\nreturn msg;'
  })
    .then('40f111', 'Core.Programming.Function', 'Prepare Sample Data', {
    func: '//Sample data for sending as html. It can be scraped data with browser nodes or read excel content etc...\nmsg.list = [\n    {name:"Michael" , surname:"William"},\n    {name:"Richard" , surname:"Simith"},\n    {name:"Cristopher" , surname:"Jones"},\n    {name:"Mark" , surname:"Davies"},\n    {name:"Harry" , surname:"Ackley"}\n  ]\nreturn msg;'
  })
    .then('ca8b15', 'Core.Programming.Function', 'Prepare HTML Content', {
    func: 'var htmlData = `<html> \n                  <head>\n                    <style> \n                      table { font-family: arial, sans-serif; border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } tr:nth-child(even) { background-color: #dddddd; } \n                    </style>\n                  </head>\n                  <body> <h2>User List</h2> <br>\n                    <table>\n                      <tr> \n                        <th>Number</th> <th>Name</th> <th>Surname</th>\n                      </tr>\n                      `\n\n \nfor(var i = 0; i < msg.list.length;i++){\n  htmlData += "<tr> <td>" + (i + 1)+"</td> <td>"+msg.list[i]["name"]+"</td> <td>"+msg.list[i]["surname"]+"</td> </tr>" \n  \n}\nhtmlData +="</table> </body> </html>"\nmsg.htmlData = htmlData\nreturn msg;'
  })
    .then('2d2239', 'Core.Mail.Send', 'Send Mail', {
    inFrom: Custom('latif@robomotion.io'),
    inTo: Custom('latif@robomotion.io'),
    inCc: Custom(''),
    inBcc: Custom(''),
    inReplyTo: Message('replyTo'),
    inSubject: Custom('test'),
    inBody: Message('htmlData'),
    optCredentials: Credential({ vaultId: '85431c47-21a2-464f-bf2c-0a7bc3e0908f', itemId: 'db4ed81a-e4b2-496e-8d65-de875e50f3ef' }),
    optHtmlBody: true,
    optAttachments: Message('attachments')
  })
    .then('e4fef7', 'Core.Flow.Stop', 'Stop', {});
}).start();
