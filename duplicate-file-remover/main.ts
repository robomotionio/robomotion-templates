import { flow, Message } from '@robomotion/sdk';

flow.create('2927f4f3-ffde-4d00-90b4-18c84b2c90e1', 'Imported Duplicate File Remover', (f) => {
  f.addDependency('Robomotion.Cryptography', '0.8.0');

  f.node('af79f7', 'Core.Flow.Comment', 'Comment', { optText: 'This template uses *Cryptography* and *File System* nodes to remove, not recursively,\nduplicated files in a given directory in your file system.\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon on the left side.\n\n**2.** Search fpr Cryptography and install it.\n\n**3.** Edit the Config Node and Update Path\n\n**4.** Set the msg.dir field to the full filepath of the directory you want to\ncheck for duplicated files.' });
  f.node('8cfaf5', 'Core.Trigger.Inject', 'Inject', {})
    .then('cf88a2', 'Core.Programming.Function', 'Config', { func: 'msg.dir = \'/Users/User/Desktop/TEST/RobomotionTemplateTest/\'; // [Required]\n\n// DO NOT edit below!\nmsg.hash_table = {};\nreturn msg;' })
    .then('585223', 'Core.FileSystem.List', 'List Directory', { inDirPath: Message('dir') });
  f.node('1ccc84', 'Core.Flow.Label', 'Next File', {});
  f.node('6a1348', 'Core.Programming.ForEach', 'For Each File', { optInput: Message('files'), optOutput: Message('file') })
    .then('3beadd', 'Core.Programming.Function', 'Get Path', { func: 'msg.path = `${msg.dir}/${msg.file.Name}`;\nreturn msg;' })
    .then('6507c9', 'Robomotion.Cryptography.HashFile', 'File Hash', {
    inFilePath: Message('path'),
    outHash: Message('hash'),
    optFunction: 'sha256-file'
  })
    .then('96b2c8', 'Core.Programming.Function', 'Check File Hash', { outputs: 2, func: 'if (msg.hash in msg.hash_table) {\n  return [null, msg];\n}\n\nmsg.hash_table[msg.hash] = {};\nreturn [msg, null];' });
  f.node('5879d6', 'Core.Flow.Stop', 'Stop', {});
  f.node('36b1eb', 'Core.FileSystem.Delete', 'Delete Duplicate', { inPath: Message('path') });
  f.node('e6e126', 'Core.Flow.GoTo', 'Go To Next File', { optNodes: { ids: ['1ccc84'], type: 'goto', all: false } });

  f.edge('585223', 0, '6a1348', 0);
  f.edge('6a1348', 1, '5879d6', 0);
  f.edge('36b1eb', 0, 'e6e126', 0);
  f.edge('96b2c8', 1, '36b1eb', 0);
  f.edge('96b2c8', 0, 'e6e126', 0);
  f.edge('1ccc84', 0, '6a1348', 0);
}).start();