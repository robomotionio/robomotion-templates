import { subflow, Message } from '@robomotion/sdk';

subflow.create('Connect', (f) => {
  f.node('783f50', 'Core.Flow.Begin', 'Begin', {});
  f.node('89b278', 'Robomotion.MySQL.Connect', 'Connect', {
    outConnectionId: Message('conn_id'),
    optHostName: Message('hostName'),
    optPort: Message('portNumber'),
    optDatabase: Message('dbName')
  });
  f.node('15a0cc', 'Robomotion.MySQL.Start', 'Start Transaction', {
    connectionId: Message('conn_id'),
    outTransactionId: Message('trx_id')
  });
  f.node('db69c9', 'Robomotion.MySQL.NonQuery', 'Execute Non Query', {
    connectionId: Message('conn_id'),
    transactionId: Message('trx_id'),
    func: 'INSERT INTO {{tableName}} VALUES("{{job}}","{{info}}","{{stat}}");'
  });
  f.node('9862eb', 'Robomotion.MySQL.Commit', 'Commit Transaction', { transactionId: Message('trx_id') })
    .then('b4a1ec', 'Robomotion.MySQL.Disconnect', 'Disconnect', { connectionId: Message('conn_id') })
    .then('ccbfb0', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('15a0cc', 0, '89b278', 0);
  f.edge('db69c9', 0, '15a0cc', 0);
  f.edge('783f50', 0, '89b278', 0);
  f.edge('db69c9', 0, '9862eb', 0);
});
