import { subflow, Message } from '@robomotion/sdk';

subflow.create('Debug', (f) => {
  f.node('a622eb', 'Core.Flow.Begin', 'Begin', {})
    .then('1d6372', 'Robomotion.MySQL.Query', 'Execute Query', {
    connectionId: Message('conn_id'),
    transactionId: Message('trx_id'),
    func: '-- ex: select ID, Name, Age, City  from users where ID = {{userId}};\n\nselect * from users;',
    outResult: Message('result')
  })
    .then('e790e8', 'Robomotion.MySQL.Commit', 'Commit Transaction', { transactionId: Message('trx_id') });
  f.node('639dc2', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('b4dc0e', 'Core.Programming.Debug', 'Debug', {
    optActive: true,
    optSysConsole: true,
    optDebugData: Message('result')
  });

  f.edge('e790e8', 0, '639dc2', 0);
  f.edge('e790e8', 0, 'b4dc0e', 0);
});
