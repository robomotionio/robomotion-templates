import { flow, Custom, JS, Message } from '@robomotion/sdk';

flow.create('3b0e85c2-4e9b-43bf-a8bc-f3569557a93d', 'Mail To MySQL Inserter', (f) => {
  f.node('31b0c1', 'Core.Flow.Comment', 'Comment', {
    optText: '# Mail To MySQL Inserter\n\n This template uses *Mail* and *MySQL* nodes to show inserting data to a MySQL table with an email triggered flow.\n \n## How it Works?\n1. Go to Flow Designer and press package icon above the node palette.\n\n2. You should see MySQL package icon, install it.\n\n3. You need to mail item (from vaults) for Get Mail and Delete Mail node credentials. See [here](https://docs.robomotion.io/getting-started/tutorials/mail) for sample mail operation with mail item.\n\n4. Timer is for one hour periods. You can change it according to your requirements.\n\n5. Go to Vaults and create new login item for mysql.\n\n6. Set this vault item to Connect node credentials.\n\n7. Edit the Config Node.\n\n8. This flow takes 3 variables(JOB, INFO, STATUS), you can add more variables from Function node.\n```js\nmsg.test = dict[\'Test\'];\n```'
  });
  f.node('46c78c', 'Core.Trigger.Timer', 'Timer', {
    inPayload: JS('Date.now()'),
    outPayload: Message('payload'),
    optSecond: -1,
    optMinute: 1,
    optHour: -1,
    optDay: 0,
    optMonth: 0,
    optWeekDay: -1
  })
    .then('c287f4', 'Core.Programming.Function', 'Config', {
    func: 'msg.dbName = "devel"; // Database name for mysql connection.\nmsg.hostName = "localhost"; // Host name for mysql connection.\nmsg.portNumber = 3306; // Port Number for mysql connection.\nmsg.tableName = "test_table"; // Table to insert data.\nreturn msg;'
  })
    .then('bf5820', 'Core.Mail.Get', 'Get Mail', {
    inMailFolder: Custom('INBOX'),
    inTop: Custom('10'),
    outMessages: Message('messages'),
    optProtocol: 'imap',
    optMarkRead: false
  });
  f.node('959e19', 'Core.Flow.Label', 'Label', {});
  f.node('3c2e3d', 'Core.Programming.Function', 'Function', {
    func: 'var chstr = msg.message.Subject;\nmsg.check = chstr.includes("#ROBO#");\nvar dict = {};\nif (msg.check === true) {\n  chstr = chstr.replace("#ROBO#","");\n  var splittedsub = chstr.split(",");\n  splittedsub.forEach(splitstr);\n  \n}\nfunction splitstr(item){\n  item = item.trim();\n  item = item.replace(" ", "");\n  var x = item.split("=");\n  key = x[0];\n  value = x[1];\n  dict[key] = value;\n}\nmsg.job = dict[\'JOB\'];\nmsg.info = dict[\'INFO\'];\nmsg.stat = dict[\'STATUS\'];\nmsg.mailId = msg.message.Uid;\nreturn msg;'
  })
    .then('5b50b5', 'Core.Programming.Switch', 'Switch', {
    outputs: 2,
    optConditions: ['msg.check === true', 'msg.check === false']
  });
  f.node('1e38da', 'Core.Programming.ForEach', 'For Each', {
    outputs: 2,
    optInput: Message('messages'),
    optOutput: Message('message')
  });
  f.node('1393fb', 'Core.Flow.Stop', 'Stop', {});
  f.node('1fbb21', 'Core.Flow.SubFlow', 'Mysql', { subflow: '5d30df73-55bf-4f29-a7bf-232525ba0de8' })
    .then('1ba72e', 'Core.Mail.Delete', 'Delete Mail', {
    inMailFolder: Custom('INBOX'),
    inUid: Message('mailId'),
    optProtocol: 'imap',
    optCredentials: Custom('{'vaultId': '_', 'itemId': '_'}'),
    optDeleteAll: false
  })
    .then('783c64', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
  f.node('6df408', 'Core.Flow.GoTo', 'Go To', { optNodes: { ids: ['959e19'], type: 'goto', all: false } });

  f.edge('bf5820', 0, '1e38da', 0);
  f.edge('1e38da', 0, '3c2e3d', 0);
  f.edge('1e38da', 1, '1393fb', 0);
  f.edge('959e19', 0, '1e38da', 0);
  f.edge('5b50b5', 0, '1fbb21', 0);
  f.edge('5b50b5', 1, '6df408', 0);
}).start();
