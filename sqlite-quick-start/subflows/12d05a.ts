import { subflow, Message } from '@robomotion/sdk';

subflow.create('Create DB', (f) => {
  f.node('60fa7c', 'Core.Flow.Begin', 'Begin', {})
    .then('6de70f', 'Robomotion.SQLite.Create', 'Create Database', { inPath: Message('dbFile'), optOverwrite: true })
    .then('f33d0b', 'Robomotion.SQLite.Connect', 'Connect', { optConnectionString: Message('dbConnStr') })
    .then('3e3c4a', 'Robomotion.SQLite.NonQuery', 'Create Table', { func: '-- ex: UPDATE users SET City = {{city}} WHERE ID = {{userId}};\n\ncreate table if not exists users (\n  id TEXT,\n  name TEXT\n);\n' })
    .then('940a8f', 'Core.Flow.End', 'End', {});
});