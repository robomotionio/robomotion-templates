import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('84208fea-812d-494f-999f-69065e60957b', 'Twitter Get Followings', (f) => {
  f.node('86e029', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Twitter Get Followings How-To \n\nThis template lists the followings of an account and saves them to excel\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.excel_path field with the path of excel that the fetched followings will be saved.\n\n**3.** Update msg.limit field with a number which is the limit of fetched followings.\n\n**4.** Update msg.twitter_account field with the account name whose followings will be fetched.\n\n**5.** Update msg.auth_token field with the auth_token cookie of your Twitter session. To obtain it follow the following steps:\n   \n       1. Login to your twitter account.\n       2. Open developer options by \n          pressing F12.\n       3. Open Application tab.\n       4. Select cookies.\n       5. Copy auth_token cookie\n          and paste it to msg.auth_token\n          field in config node.'
  });
  f.node('1767d8', 'Core.Trigger.Inject', 'Start', {})
    .then('2ef153', 'Core.Programming.Function', 'Config', {
    func: '// Twitter auth_token from Cookie\n\nmsg.excel_path = "C:\\\\twitter_followings.xlsx"; //[Required] The path of excel file that the followings will be saved\nmsg.limit = 100; //[Required] The limit of followings number that will be saved\nmsg.twitter_account = "robomotionio" //[Required] The twitter account whose followings will be saved\nmsg.auth_token = ""; // [Required] The auth_token cookie of your twitter session\nreturn msg;\n'
  })
    .then('92ef97', 'Core.Flow.SubFlow', 'Open Twitter', { subflow: '3af615fe-fdb2-427d-9018-89f9075cdb98' })
    .then('b5eec1', 'Core.Flow.SubFlow', 'Get Followings', { subflow: '8cc780a8-0866-4024-9ef8-e09c4c66193f' })
    .then('3af3a3', 'Core.Flow.Stop', 'Stop', {});
}).start();
