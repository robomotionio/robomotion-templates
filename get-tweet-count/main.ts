import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('6758d77d-8894-409a-8dd0-f3747407f328', 'Get Tweet Count', (f) => {
  f.node('55fcab', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Twitter Get Followers How-To \n\nThis template returns the tweet count that specified accounts tweeted and saves to excel\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Download the sample excel file from [here](https://github.com/robomotionio/robomotion-templates/raw/master/files/twitter_accounts.xlsx)\n\n**3.** Update msg.excel_path field with the path of excel file you downloaded\n\n**5.** Update msg.auth_token field with the auth_token cookie of your Twitter session. To obtain it follow the following steps:\n   \n       1. Login to your twitter account.\n       2. Open developer options by \n          pressing F12\n       3. Open Application tab\n       4. Select cookies\n       5. Copy auth_token cookie\n          and paste it to msg.auth_token\n          field in config node'
  });
  f.node('1767d8', 'Core.Trigger.Inject', 'Start', {})
    .then('2ef153', 'Core.Programming.Function', 'Config', {
    func: 'msg.excel_path = "C:\\\\twitter_accounts.xlsx"; //[Required] The path of excel file that the followers will be saved\nmsg.auth_token = ""; // [Required] The auth_token cookie of your twitter session\n\nmsg.account_counter = 0; //Do not change\nreturn msg;\n'
  })
    .then('d53fb4', 'Core.Flow.SubFlow', 'Read Excel', { subflow: '7a39a886-6bd5-4f77-8653-8ae044a1b4ed' })
    .then('92ef97', 'Core.Flow.SubFlow', 'Open Twitter', { subflow: '3af615fe-fdb2-427d-9018-89f9075cdb98' });
  f.node('721cde', 'Core.Flow.Label', 'Next Account', {});
  f.node('5a4006', 'Core.Programming.ForEach', 'For Each Account', {
    outputs: 2,
    optInput: Message('table.rows'),
    optOutput: Message('row')
  });
  f.node('494261', 'Core.Flow.SubFlow', 'Write To Excel', { subflow: '55027cdb-b0da-4128-b56d-dbaef613dd32' })
    .then('f7e931', 'Core.Programming.Function', 'Prepare Message', {
    func: 'msg.message = "The tweet counts saved to: " + msg.excel_path; \nreturn msg;'
  })
    .then('ab4822', 'Core.Dialog.MessageBox', 'Message Box', {
    inText: Message('message'),
    inTitle: Custom('Flow Finished')
  })
    .then('3af3a3', 'Core.Flow.Stop', 'Stop', {});
  f.node('fb0014', 'Core.Flow.SubFlow', 'Get Tweet Count', { subflow: 'f26514ec-86ca-428c-a741-a9db9b879aa1' })
    .then('8181ee', 'Core.Flow.GoTo', 'Go To Next Account', { optNodes: { ids: ['721cde'], type: 'goto', all: false } });

  f.edge('92ef97', 0, '5a4006', 0);
  f.edge('5a4006', 0, 'fb0014', 0);
  f.edge('5a4006', 1, '494261', 0);
  f.edge('721cde', 0, '5a4006', 0);
}).start();
