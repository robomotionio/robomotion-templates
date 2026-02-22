import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('fab6d1b3-9ec4-452c-b414-6312a99f0460', 'MongoDB Quick Start', (f) => {
  f.node('e7d605', 'Core.Flow.Comment', 'Comment', {
    optText: '#### MongoDB Quick Start\n\n###### This flow shows how to use MongoDB package\n\n1. Go to Flow Designer and press package icon above the node palette.\n2. You should see MongoDB package icon, install it.\n3. If required update the input and options region of Connect node.\n4. Edit Config node and set the msg.dbName and msg.collectionName fields.'
  });
  f.node('8f0e24', 'Core.Trigger.Inject', 'Inject', {})
    .then('dbd915', 'Core.Programming.Function', 'Config', {
    func: 'msg.dbName = \'SampleDB\';\nmsg.collectionName = \'SampleCollection\';\nreturn msg;'
  })
    .then('16a525', 'Robomotion.MongoDB.Connect', 'Connect', {
    inHost: Custom('localhost'),
    inPort: Custom('27017'),
    outClientId: Message('client_id'),
    optOptions: Custom('')
  })
    .then('5e16b5', 'Robomotion.MongoDB.CreateDatabase', 'Create Database', {
    inDbName: Message('dbName'),
    inMongoClientId: Message('client_id')
  })
    .then('db2a46', 'Robomotion.MongoDB.CreateCollection', 'Create Collection', {
    inColName: Message('collectionName'),
    inDbName: Message('dbName'),
    inMongoClientId: Message('client_id')
  })
    .then('5915d8', 'Robomotion.MongoDB.InsertDocument', 'Insert Document', {
    func: '{\n	"item": "sampleitem",\n	"qty": 75,\n	"size": [{\n			"h": 22.85,\n			"w": 30,\n			"uom": "cm"\n		},\n		{\n			"h": 22.67,\n			"w": 30,\n			"uom": "cm"\n		}\n	],\n	"status": "D"\n}',
    inColName: Message('collectionName'),
    inDbName: Message('dbName'),
    inMongoClientId: Message('client_id')
  })
    .then('10b188', 'Robomotion.MongoDB.ReadDocument', 'Read Document', {
    func: '{\n  "qty": 75\n}',
    inColName: Message('collectionName'),
    inDbName: Message('dbName'),
    inMongoClientId: Message('client_id'),
    outDocument: Message('document')
  })
    .then('b60ac7', 'Robomotion.MongoDB.UpdateDocument', 'Update Document', {
    func: '{\n	"filter": {\n		"item": "sampleitem"\n	},\n	"update": {\n		"$set": {\n			"status": "A"\n		},\n		"$currentDate": {\n			"lastModified": true\n		}\n	}\n}',
    inColName: Message('collectionName'),
    inDbName: Message('dbName'),
    inMongoClientId: Message('client_id'),
    outResult: Message('result')
  })
    .then('45f40a', 'Core.Flow.Stop', 'Stop', {});
}).start();
