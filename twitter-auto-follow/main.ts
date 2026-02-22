import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('78928ea8-3c4d-4e46-bbff-0005a042b87c', 'Twitter Auto Follow', (f) => {
  f.node('52c5f8', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Twitter Auto Follow How-To \n\nThis template follows a specified acount\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.twitter_account field with the account name which will be followed\n\n**3.** Update msg.auth_token field with the auth_token cookie of your Twitter session. To obtain it follow the following steps:\n   \n       1. Login to your twitter account.\n       2. Open developer options by \n          pressing F12\n       3. Open Application tab\n       4. Select cookies\n       5. Copy auth_token cookie\n          and paste it to msg.auth_token\n          field in config node'
  });
  f.node('0f1a00', 'Core.Trigger.Inject', 'Start', {})
    .then('da8634', 'Core.Programming.Function', 'Config', {
    func: '// Twitter auth_token from Cookie\n\nmsg.twitter_account = "robomotionio" //[Required] The twitter account which will be followed\nmsg.auth_token = ""; // [Required] The auth_token cookie of your twitter session\nreturn msg;\n'
  })
    .then('c1dbc4', 'Core.Flow.SubFlow', 'Open Twitter', { subflow: 'cffe37a5-82c3-4bd2-bef4-1e50e006cdbf' })
    .then('f3fe19', 'Core.Flow.SubFlow', 'Auto Follow', { subflow: '6c1b9d75-531b-4d06-90d2-7c44c7394f2f' })
    .then('db9419', 'Core.Flow.Stop', 'Stop', {});
}).start();
