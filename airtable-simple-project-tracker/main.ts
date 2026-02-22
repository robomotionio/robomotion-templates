import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('e11f4d68-3210-45a4-94dc-e779deb8950b', 'Airtable Simple Project Tracker', (f) => {
  f.node('9d4840', 'Core.Flow.Comment', 'Comment', {
    optText: '## Airtable Simple Project Tracker\n\nShows how to make some Airtable operations\n\n### How it Works?\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Airtable package icon, install it.\n\n**3.** Edit the Config Node.\n\n**4.** Set the msg.baseId to the id of your base in Airtable.\n\n**5.** Set the msg.projectId to the id of project which you want to assign a task.\n\n**6.** Set the msg.tableName to the name of table which you want to change.\n\n**7.** You need a vault item that contain Airtable API key for access, see [here](https://support.airtable.com/hc/en-us/articles/219046777-How-do-I-get-my-API-key).\n\n**8.** Set your key to Connect node\'s Api Key field.'
  });
  f.node('0b2bd9', 'Core.Trigger.Inject', 'Start', {})
    .then('5becc7', 'Core.Programming.Function', 'Config', {
    func: 'msg.baseId = "appst3mozosVNIJ9q"; // Your Base Id.  \nmsg.projectId = "rec6I5R0auFnjauBK"; // Project Id to assign a task.\nmsg.tableName = "Tasks"; // Your table name.\nmsg.recordtoCreate = {\n	"fields": {\n		"Name": "Prepare a template",\n		"Assignee": [\n			"Joshua Gray"\n		],\n		"Project": [\n			msg.projectId\n		],\n		"Completed": false,\n		"Notes": "Airtable template"\n	}\n};\nreturn msg;'
  })
    .then('7121f4', 'Robomotion.Airtable.Connect', 'Connect', {
    outKeyId: Message('key_id'),
    optKey: Custom('{'vaultId': '_', 'itemId': '_'}')
  })
    .then('87ade0', 'Robomotion.Airtable.CreateRecord', 'Create Record', {
    inBaseId: Message('baseId'),
    inKeyID: Message('key_id'),
    inRecord: Message('recordtoCreate'),
    inTableName: Message('tableName'),
    outResult: Message('result')
  })
    .then('fb874d', 'Core.Programming.Function', 'Record for Update', {
    func: 'msg.recordId = msg.result["id"];\nmsg.recordtoUpdate = {\n  "records": [\n    {\n      "id": msg.recordId,\n      "fields": {\n        "Name": "Prepare a template",\n        "Assignee": [\n          "Joshua Gray",\n          "Carl Coleman"\n        ],\n        "Project": [\n          msg.projectId\n        ],\n        "Completed": true,\n        "Notes": "Template is ready"\n      }\n    }\n]\n};\nreturn msg;'
  })
    .then('af57a7', 'Robomotion.Airtable.UpdateRecord', 'Update Record', {
    inBaseId: Message('baseId'),
    inKeyID: Message('key_id'),
    inRecord: Message('recordtoUpdate'),
    inTableName: Message('tableName'),
    outResult: Message('result'),
    delayBefore: 5
  })
    .then('07b922', 'Robomotion.Airtable.ReadRecord', 'Read Record', {
    inBaseId: Message('baseId'),
    inKeyID: Message('key_id'),
    inRecordID: Message('recordId'),
    inTableName: Message('tableName'),
    outResult: Message('result'),
    delayBefore: 5
  })
    .then('45bfc1', 'Robomotion.Airtable.DeleteRecord', 'Delete Record', {
    inBaseId: Message('baseId'),
    inKeyID: Message('key_id'),
    inRecordID: Message('recordId'),
    inTableName: Message('tableName'),
    outResult: Message('result'),
    delayBefore: 5
  })
    .then('caec92', 'Robomotion.Airtable.ListRecords', 'List Records', {
    inBaseId: Message('baseId'),
    inKeyID: Message('key_id'),
    inTableName: Message('tableName'),
    outResult: Message('result'),
    optQuery: Custom(''),
    optViewName: Custom(''),
    delayBefore: 5
  })
    .then('43f187', 'Robomotion.Airtable.Disconnect', 'Disconnect', { inKeyID: Message('key_id') })
    .then('036b57', 'Core.Flow.Stop', 'Stop', {});
}).start();
