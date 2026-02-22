import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('a09e5d5d-a5c1-4b32-b0c7-0d4f01ee00ba', 'Twitter Get Followers', (f) => {
  f.node('55fcab', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Twitter Get Followers How-To \n\nThis template lists the followers of an account and saves them to excel\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.excel_path field with the path of excel that the fetched followers will be saved\n\n**3.** Update msg.limit field with a number which is the limit of fetched followers\n\n**4.** Update msg.twitter_account field with the account name whose followers will be fetched\n\n**5.** Update msg.auth_token field with the auth_token cookie of your Twitter session. To obtain it follow the following steps:\n   \n       1. Login to your twitter account.\n       2. Open developer options by \n          pressing F12\n       3. Open Application tab\n       4. Select cookies\n       5. Copy auth_token cookie\n          and paste it to msg.auth_token\n          field in config node'
  });
  f.node('1767d8', 'Core.Trigger.Inject', 'Start', {})
    .then('2ef153', 'Core.Programming.Function', 'Config', {
    func: 'msg.excel_path = "C:\\\\twitter_followers.xlsx"; //[Required] The path of excel file that the followers will be saved\nmsg.limit = 100; //[Required] The limit of followers number that will be saved\nmsg.twitter_account = "robomotionio" //[Required] The twitter account whose followers will be saved\nmsg.auth_token = ""; // [Required] The auth_token cookie of your twitter session\nreturn msg;\n'
  })
    .then('92ef97', 'Core.Flow.SubFlow', 'Open Twitter', { subflow: '3af615fe-fdb2-427d-9018-89f9075cdb98' })
    .then('fb0014', 'Core.Flow.SubFlow', 'Get Followers', { subflow: 'f26514ec-86ca-428c-a741-a9db9b879aa1' })
    .then('3af3a3', 'Core.Flow.Stop', 'Stop', {});
}).start();
