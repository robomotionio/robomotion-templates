import { flow } from '@robomotion/sdk';

flow.create('cacd4633-c645-4f26-89bc-7c69d2cdc2de', 'Imported Merge CSV', (f) => {
  f.node('315158', 'Core.Trigger.Inject', 'Inject', {})
    .then('330ee0', 'Core.Programming.Function', 'config', { func: 'msg.csv_path = \'/Users/ercanertuzun/Desktop/TEST/RobomotionTemplateTest/merge.csv\'; // [Required]\nmsg.in_dir = \'/Users/ercanertuzun/Desktop/TEST/RobomotionTemplateTest\' // [Required]\nmsg.separator = \';\'; // [Required] - [\',\', \';\', \'TAB\', \'SPACE\'] \n\n// DO NOT edit below.\nmsg.table = {columns: [], rows: []};\nreturn msg;' })
    .then('4826d5', 'Core.Flow.SubFlow', 'Read CSV Files', {})
    .then('d2a1a6', 'Core.Flow.SubFlow', 'Merge CSV', {})
    .then('a1862c', 'Core.Flow.Stop', 'Stop', {});
  f.node('921285', 'Core.Flow.Comment', 'Comment', { optText: '##### Merge CSV How-To \n\nThis template uses CSV and File System nodes to merge a group of .csv files\ninto a CSV file.\n\n*1.* Edit the Config Node\n\n*2.* Set the msg.csv_path field to the full filepath of CSV file to be merged.\n\n*3.* Set the msg.in_dir field to the full path of input directory containing .csv files.\n\n*4.* Set the msg.separator field to the separator value that is used in .csv files\n(\',\', \';\', \'TAB\', \'SPACE\').' });
}).start();