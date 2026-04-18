import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('f16e8944-9f01-4fe0-b787-23b3d543f62c', 'Imported Copy Files', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Copy Files\n\nCopies every file from a source directory into a destination, with optional overwrite. Demonstrates how to enumerate files and drive file-system operations from a subflow.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10002', 'Core.Programming.Function', 'Seed Sources', {
      func: `var fixtures = global.get('$Home$') + '/templates/desktop-automation/copy-files/fixtures';
msg.fixtures_dir = fixtures;
msg.files_to_copy = [fixtures + '/source_a.txt', fixtures + '/source_b.txt'];
msg.default_dest = fixtures + '/dest';
return msg;`,
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Destination Folder', {
      inTitle: Custom('Copy files'),
      inText: Custom('Select the folder to copy the file to..'),
      optDefault: Message('default_dest'),
      outText: Message('destination_folder'),
    })
    .then('a10004', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return (msg.destination_folder && msg.destination_folder.trim()) ? [msg, null] : [null, msg];`,
    });

  f.node('a10005', 'Core.FileSystem.Create', 'Create Dest Dir', {
    inPath: Message('destination_folder'),
    optType: 'directory',
    continueOnError: true,
  })
    .then('a10006', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10010', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10011', 'Core.Programming.ForEach', 'For Each File', {
      optInput: Message('files_to_copy'),
      optOutput: Message('current_file'),
      optIndex: Message('current_index'),
    });

  f.node('a10012', 'Core.Programming.Function', 'Build Dest Path', {
    func: `var p = msg.current_file;
var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\'));
msg.dest_path = msg.destination_folder + '/' + p.substring(lastSlash + 1);
return msg;`,
  })
    .then('a10013', 'Core.FileSystem.Copy', 'Copy File', {
      inSrcPath: Message('current_file'),
      inDestPath: Message('dest_path'),
      continueOnError: true,
    })
    .then('a10014', 'Core.Flow.GoTo', 'Loop Back', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10099', 0);
  f.edge('a10011', 0, 'a10012', 0);
  f.edge('a10011', 1, 'a10099', 0);
});

myFlow.start();
