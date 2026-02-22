import { subflow, Message } from '@robomotion/sdk';

subflow.create('Create Database', (f) => {
  f.node('f2c340', 'Core.Flow.Begin', 'Begin', {});
  f.node('db6a17', 'Robomotion.SQLite.Connect', 'Connect', {
    outConnectionId: Message('conn_id'),
    optConnectionString: Message('dbConnStr')
  });
  f.node('d84ade', 'Robomotion.SQLite.Create', 'Create Database', {
    inPath: Message('dbFile'),
    optOverwrite: true
  });
  f.node('c51165', 'Robomotion.SQLite.NonQuery', 'Create Table', {
    func: '-- ex: UPDATE users SET City = {{city}} WHERE ID = {{userId}};\n\nCREATE TABLE IF NOT EXISTS \'products\' (\n	\'id\' TEXT UNIQUE NOT NULL,\n	\'created_at\' DATETIME DEFAULT CURRENT_TIMESTAMP,\n	\'productTitle\' TEXT,\n	\'productPrice\' TEXT, \n	\'productDescription\' TEXT, \n  \'productDescription2\' TEXT, \n	\'productLink\' TEXT,\n  \'featuredBullett\' TEXT, \n  \'productImage\' TEXT\n);\n',
    inConnectionId: Message('conn_id'),
    inTransactionId: Message('trx_id')
  });
  f.node('8980fc', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('db6a17', 0, 'd84ade', 0);
  f.edge('c51165', 0, 'db6a17', 0);
  f.edge('f2c340', 0, 'd84ade', 0);
  f.edge('c51165', 0, '8980fc', 0);
});
