import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('a529cee7-2b63-480f-befa-6a880d25aabd', 'MySQL Quick Start', (f) => {
  f.node('5a6ab8', 'Core.Flow.Comment', 'Comment', {
    optText: '#### MySQL Quick Start\n\nShows how to use MySQL package\n\n1. Go to Flow Designer and press package icon above the node palette.\n2. You should see MySQL package icon, install it.\n3. Edit the Config node.'
  });
  f.node('067cc5', 'Core.Trigger.Inject', 'Start', {})
    .then('915680', 'Core.Programming.Function', 'Config', {
    func: 'msg.host = "localhost"; // Host Name.\nmsg.port = 3306; // Port Number.\nmsg.dbName = "Robomotion"; // Database Name.\n\nreturn msg;'
  })
    .then('a7839c', 'Core.Flow.SubFlow', 'Connect To DB', { subflow: '16208263-06b9-40ae-b6c0-ea7da1c39641' })
    .then('7b3aa4', 'Core.Flow.SubFlow', 'Insert Row', { subflow: '9f89d672-425c-4dc1-ba7c-1fc1e38e7573' })
    .then('98663f', 'Core.Flow.SubFlow', 'Insert Table', { subflow: '43791d75-d9b0-4c60-bcfd-8a267ccb55f7' })
    .then('d98181', 'Core.Flow.SubFlow', 'Select', { subflow: 'fb03b3d6-8a70-4e96-9770-e1cec362d589' })
    .then('67a3ea', 'Core.Flow.Stop', 'Stop', {});
}).start();
