import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('2c6e2eca-6621-43c3-b92b-56ab5696f126', 'Birthday Celebrator', (f) => {
  f.node('823862', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Birthdate Celebrator How-To \n\nThis template uses *Excel* and *Slack* nodes to send birthday messages.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Download the sample excel file from [here](https://github.com/robomotionio/robomotion-templates/raw/master/files/birthdays.xlsx)\n\n**3** Update some of the birthdays to current date with *dd.mm.yyyy* format in downloaded excel\n \n**4.** Set the msg.excel_path field to the path you downloaded the Excel file\n\n**5.** Set the slack environment by following [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration) instructions.'
  });
  f.node('c06104', 'Core.Trigger.Inject', 'Inject', {})
    .then('e44a36', 'Core.Programming.Function', 'Config', {
    func: 'msg.excel_path = \'C:\\\\birthdays.xlsx\'; // [Required] The excel that includes birthdays of the employees\nmsg.sheet_name = \'birthdays\'; // [Optional]\nmsg.channel_name = "channel"; // [Optional] //The name of the slack channel that you want to send the messages\nreturn msg;'
  })
    .then('938091', 'Core.Flow.SubFlow', 'Read Excel', { subflow: '8a5c29dd-ca0b-4ac2-9c39-f2321446f185' })
    .then('937257', 'Core.Flow.SubFlow', 'Notify Slack', { subflow: 'cc3e258c-726a-4f3f-8382-4ee5804afce3' })
    .then('8b50ae', 'Core.Flow.Stop', 'Stop', {});
}).start();
