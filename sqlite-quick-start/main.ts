import { flow } from '@robomotion/sdk';

flow.create('320f330c-fb6d-4fdb-a9f1-61d3939773d6', 'Imported SQLite Quick Start', (f) => {
  f.addDependency('robomotion.sqlite', '1.0.7');

  f.node('cbb523', 'Core.Flow.Comment', 'Comment', { optText: '# SQLite Quick Start How-To\n\nThis template shows how to use the SQLite package for database operations.\n\n## Usage Steps\n\n### 1. Install SQLite Package\n\nGo to Flow Designer and press the package icon above the node palette. You should see the SQLite package icon - install it.\n\n### 2. Edit the Config Node\n\nClick on the Config Node to open the settings panel.\n\n### 3. Update the Home Variable\n\nUpdate the `home` variable in the Config node to specify the database location path. For example: `/Users/username/databases/` or `C:\\Users\\username\\databases\\`\n\n## Result\n\nWhen the flow is executed, the template will be ready to perform SQLite database operations at your specified location.' });
  f.node('3cc4c6', 'Core.Trigger.Inject', 'Start', {})
    .then('6a6e4b', 'Core.Programming.Function', 'Config', { func: '// For Linux\n//var home = "/home/john/";\n\n// For Mac\nvar home = "/Users/ercanertuzun/Desktop/TEST/RobomotionTemplateTest/"\n\n// For Windows\n// var home = "C:\\\\Users\\john\\\\"\n\n\nmsg.dbFile = home + "test.db";\nmsg.dbConnStr = "Data Source=" + msg.dbFile + ";Version=3;";\n\nreturn msg;' })
    .then('12d05a', 'Core.Flow.SubFlow', 'Create DB', {})
    .then('9021c2', 'Core.Flow.SubFlow', 'Instert Row', {})
    .then('fa975a', 'Core.Flow.SubFlow', 'Insert Table', {})
    .then('886abb', 'Core.Flow.SubFlow', 'Select', {})
    .then('5996fe', 'Core.Flow.Stop', 'Stop', {});
}).start();