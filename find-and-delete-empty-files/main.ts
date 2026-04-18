import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('ab2e1663-2766-4215-b465-3e1c1a2fd4e9', 'Imported Find and Delete Empty Files', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Find and Delete Empty Files\n\nWalks a directory, locates zero-byte files, and deletes them in a single pass. Handy for cleaning up broken export folders.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Seed Sources', {
      func: `var fixtures = global.get('$Home$') + '/templates/desktop-automation/find-and-delete-empty-files/fixtures'; msg.fixtures_dir = fixtures; msg.empty_one_path = fixtures + '/empty_one.txt'; msg.empty_two_path = fixtures + '/empty_two.txt'; return msg;`,
    })
    .then('a10002', 'Core.FileSystem.Create', 'Seed Empty File 1', {
      inPath: Message('empty_one_path'),
      optType: 'file',
      continueOnError: true,
    })
    .then('a10003', 'Core.FileSystem.Create', 'Seed Empty File 2', {
      inPath: Message('empty_two_path'),
      optType: 'file',
      continueOnError: true,
    })
    .then('a10004', 'Core.Dialog.InputBox', 'Ask Folder', {
      inTitle: Custom('Delete empty files'),
      inText: Custom('Please select the folder to delete files from....'),
      optDefault: Message('fixtures_dir'),
      outText: Message('selected_folder'),
    })
    .then('a10005', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return (msg.selected_folder && msg.selected_folder.trim()) ? [msg, null] : [null, msg];`,
    });

  f.node('a10006', 'Core.FileSystem.List', 'List Folder', {
    inDirPath: Message('selected_folder'),
    optAbsolutePath: true,
    optSize: true,
    optIsDir: true,
    optTop: 0,
    outFiles: Message('all_files_in_folder'),
  })
    .then('a10007', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10010', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10011', 'Core.Programming.ForEach', 'For Each File', {
      optInput: Message('all_files_in_folder'),
      optOutput: Message('current_file'),
    });

  f.node('a10012', 'Core.Programming.Function', 'Zero-Size Check', {
    outputs: 2,
    func: `var f = msg.current_file || {}; return (!f.IsDir && Number(f.Size) === 0) ? [msg, null] : [null, msg];`,
  });

  f.node('a10013', 'Core.Programming.Function', 'Build File Path', {
    func: `msg.file_to_delete = msg.current_file.Name; return msg;`,
  })
    .then('a10014', 'Core.FileSystem.Delete', 'Delete Empty File', {
      inPath: Message('file_to_delete'),
      continueOnError: true,
    })
    .then('a10015', 'Core.Flow.GoTo', 'Loop Back After Delete', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10016', 'Core.Flow.GoTo', 'Loop Back Skip', {
    optNodes: { type: 'goto', ids: ['a10010'], all: false },
  });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10005', 0, 'a10006', 0);
  f.edge('a10005', 1, 'a10099', 0);
  f.edge('a10011', 0, 'a10012', 0);
  f.edge('a10011', 1, 'a10099', 0);
  f.edge('a10012', 0, 'a10013', 0);
  f.edge('a10012', 1, 'a10016', 0);
});

myFlow.start();
