import { subflow } from '@robomotion/sdk';

subflow.create('Create DB', (f) => {
  f.node('a782ed', 'Core.Flow.Begin', 'Begin', {});
  f.node('b8de0d', 'Core.Programming.Function', 'Init DB', {
    func: 'msg.dbFile = global.get("$Home$") + "/Desktop/products.db";\nmsg.dbConnStr = "Data Source=" + msg.dbFile + ";Version=3;";\n\nreturn msg;'
  });
  f.node('4d1d77', 'Core.Flow.SubFlow', 'Create DB', { subflow: 'bb39a7ed-1982-4b67-97c2-b109c40833c7' });
  f.node('e04fe3', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('4d1d77', 0, 'b8de0d', 0);
  f.edge('4d1d77', 0, 'e04fe3', 0);
  f.edge('a782ed', 0, 'b8de0d', 0);
});
