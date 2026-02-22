import { subflow, Message } from '@robomotion/sdk';

subflow.create('Connect', (f) => {
  f.node('3e00ba', 'Core.Flow.Begin', 'Begin', {})
    .then('fa49de', 'Robomotion.MySQL.Connect', 'Connect', {
    outConnectionId: Message('conn_id'),
    optHostName: Message('host'),
    optPort: Message('port'),
    optDatabase: Message('dbName')
  })
    .then('073117', 'Robomotion.MySQL.Start', 'Start Transaction', {
    connectionId: Message('conn_id'),
    outTransactionId: Message('trx_id')
  })
    .then('89f08f', 'Robomotion.MySQL.NonQuery', 'Create Table', {
    connectionId: Message('conn_id'),
    transactionId: Message('trx_id'),
    func: '-- ex: UPDATE users SET City = {{city}} WHERE ID = {{userId}};\n\ncreate table if not exists users (\n  id TEXT,\n  name TEXT\n);\n'
  })
    .then('f3276b', 'Core.Flow.End', 'End', { sfPort: 0 });
});
