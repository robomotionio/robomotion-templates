import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('f7b5f2b4-d52e-4ae5-8cda-9c982062c366', 'Split CSV', (f) => {
  f.node('9ce6a1', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Split CSV How-To \n\nThis template uses *CSV* and *File System* nodes to split a CSV file to a group of .csv files\ncontaining at most specified amount of rows.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.csv_path field to the full filepath of .csv file you want to split.\n\n**3.** Set the msg.out_dir field to the full path of output directory you want to store\nthe resulting CSV files.\n\n**4.** Set the msg.per_page field to the number of rows each file should contain at most.\n\n**5.** Set the msg.separator field to the separator value that is used in CSV file\n(\',\', \';\', \'TAB\', \'SPACE\').'
  });
  f.node('717399', 'Core.Trigger.Inject', 'Inject', {})
    .then('fdb792', 'Core.Programming.Function', 'Config', {
    func: 'msg.csv_path = \'/home/gursoy/Downloads/test.csv\'; // [Required]\nmsg.out_dir = \'/home/gursoy/test\' // [Required] (Directory will be created if not exists)\nmsg.per_page = 10; // [Required]\nmsg.separator = \';\'; // [Required] - [\',\', \';\', \'TAB\', \'SPACE\'] \n\nreturn msg;'
  })
    .then('78f865', 'Core.Flow.SubFlow', 'Read CSV', { subflow: '7989b62e-f48b-4aba-b937-d407c8a424b4' })
    .then('fd160f', 'Core.Flow.SubFlow', 'Split CSV', { subflow: '76c20a25-f9e6-446e-a5e4-a467ad29a759' })
    .then('0567b8', 'Core.Flow.Stop', 'Stop', {});
}).start();
