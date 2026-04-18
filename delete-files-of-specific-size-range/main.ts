import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('bfd491c1-40ac-4c16-838b-d48add842b43', 'Imported Delete Files of Specific Size Range', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Delete Files of Specific Size Range\n\nScans a directory and deletes files whose size falls inside a min/max range. Useful for pruning oversized logs or clearing tiny scratch files.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Seed Sources', {
      func: `var fixtures = global.get('$Home$') + '/templates/desktop-automation/delete-files-of-specific-size-range/fixtures'; msg.fixtures_dir = fixtures; msg.small_path = fixtures + '/small.txt'; msg.medium_path = fixtures + '/medium.txt'; msg.large_path = fixtures + '/large.txt'; return msg;`,
    })
    .then('a10002', 'Core.FileSystem.WriteFile', 'Seed Small File', {
      inPath: Message('small_path'),
      inText: Custom('x'.repeat(200)),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10003', 'Core.FileSystem.WriteFile', 'Seed Medium File', {
      inPath: Message('medium_path'),
      inText: Custom('x'.repeat(3072)),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10004', 'Core.FileSystem.WriteFile', 'Seed Large File', {
      inPath: Message('large_path'),
      inText: Custom('x'.repeat(20480)),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10005', 'Core.Dialog.InputBox', 'Ask Min Size KB', {
      inTitle: Custom('Delete files by size range'),
      inText: Custom('What is the minimum size of the files you want to delete? (in KB)'),
      optDefault: Custom('1'),
      outText: Message('min_size_text'),
    })
    .then('a10006', 'Core.Dialog.InputBox', 'Ask Max Size KB', {
      inTitle: Custom('Delete files by size range'),
      inText: Custom('What is the maximum size of the files you want to delete? (in KB)'),
      optDefault: Custom('10'),
      outText: Message('max_size_text'),
    })
    .then('a10007', 'Core.Dialog.InputBox', 'Ask Folder', {
      inTitle: Custom('Delete files by size range'),
      inText: Custom('Please select the folder to delete files from....'),
      optDefault: Message('fixtures_dir'),
      outText: Message('selected_folder'),
    })
    .then('a10008', 'Core.Programming.Function', 'Parse Inputs', {
      outputs: 2,
      func: `msg.minimum_size = Number(msg.min_size_text); msg.maximum_size = Number(msg.max_size_text); if (!msg.selected_folder || isNaN(msg.minimum_size) || isNaN(msg.maximum_size)) return [null, msg]; return [msg, null];`,
    });

  f.node('a10009', 'Core.FileSystem.List', 'List Folder', {
    inDirPath: Message('selected_folder'),
    optAbsolutePath: true,
    optSize: true,
    optIsDir: true,
    optTop: 0,
    outFiles: Message('all_files_in_folder'),
  })
    .then('a10010', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10020'], all: false },
    });

  f.node('a10020', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10021', 'Core.Programming.ForEach', 'For Each File', {
      optInput: Message('all_files_in_folder'),
      optOutput: Message('current_file'),
    });

  f.node('a10022', 'Core.Programming.Function', 'Size Range Check', {
    outputs: 2,
    func: `var f = msg.current_file || {}; if (f.IsDir) return [null, msg]; var kb = Number(f.Size) / 1024; return (kb >= msg.minimum_size && kb <= msg.maximum_size) ? [msg, null] : [null, msg];`,
  });

  f.node('a10023', 'Core.Programming.Function', 'Build Target Path', {
    func: `msg.file_to_delete = msg.current_file.Name; return msg;`,
  })
    .then('a10026', 'Core.FileSystem.Delete', 'Delete In-Range File', {
      inPath: Message('file_to_delete'),
      continueOnError: true,
    })
    .then('a10024', 'Core.Flow.GoTo', 'Loop Back After Delete', {
      optNodes: { type: 'goto', ids: ['a10020'], all: false },
    });

  f.node('a10025', 'Core.Flow.GoTo', 'Loop Back Skip', {
    optNodes: { type: 'goto', ids: ['a10020'], all: false },
  });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10008', 0, 'a10009', 0);
  f.edge('a10008', 1, 'a10099', 0);
  f.edge('a10021', 0, 'a10022', 0);
  f.edge('a10021', 1, 'a10099', 0);
  f.edge('a10022', 0, 'a10023', 0);
  f.edge('a10022', 1, 'a10025', 0);
});

myFlow.start();
