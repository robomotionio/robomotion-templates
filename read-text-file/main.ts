import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('b442d8a8-13fd-4e4c-bfaa-fbad67b1abe1', 'Imported Read Text File', (f) => {
  f.node('f74488', 'Core.Flow.Comment', 'Comment', { optText: '# Read Text File How-To\n\nThis template uses the *FileSystem.ReadFile* node to read the content of a text file from your file system.\n\n## Usage Steps\n\n### 1. Edit the Config Node\n\nClick on the Config Node to open the settings panel.\n\n### 2. Set the File Path\n\nSet the `msg.file_path` field to the full filepath of the text file you want to read. For example: `/Users/username/Documents/myfile.txt` or `C:\\Users\\username\\Documents\\myfile.txt`\n\n## Result\n\nWhen the flow is executed, the template will read the content of the specified text file and make it available for further processing.' });
  f.node('5ee1f5', 'Core.Trigger.Inject', 'Inject', {})
    .then('7dfc39', 'Core.Programming.Function', 'Config', { func: 'msg.file_path = \'/Users/.../test.txt\'; // [Required]\nreturn msg;' })
    .then('1a4694', 'Core.FileSystem.ReadFile', 'Read File', { inPath: Message('file_path') })
    .then('1f3578', 'Core.Dialog.MessageBox', 'Message Box', { inTitle: Custom('Output: '), inText: Message('text') })
    .then('8f1a9c', 'Core.Flow.Stop', 'Stop', {});
}).start();