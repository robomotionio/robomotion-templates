import { subflow } from '@robomotion/sdk';

subflow.create('Select', (f) => {
  f.node('543fcf', 'Core.Flow.Begin', 'Begin', {})
    .then('7656e5', 'Robomotion.SQLite.Query', 'Execute Query', { func: '-- ex: select ID, Name, Age, City  from users where ID = {{userId}};\n\nselect * from users;\n' });
  f.node('96a1fd', 'Core.Flow.End', 'End', {});
  f.node('7dbfe9', 'Core.Programming.Debug', 'Debug', {});

  f.edge('7656e5', 0, '96a1fd', 0);
  f.edge('7656e5', 0, '7dbfe9', 0);
});