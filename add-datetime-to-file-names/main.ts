import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('3fcd90e9-d470-4ad7-9ddd-dccdaf2f2b1f', 'Imported Add Datetime to File Names', (f) => {
  f.addDependency('Robomotion.DateTime', '0.1.4');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Add Datetime to File Names\n\nRenames every file in a directory by appending the current date to its name. A quick way to version artefacts, snapshots, or export batches.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10020', 'Core.Programming.Function', 'Build Default Folder', {
      func: `msg.default_folder = global.get('$Home$') + '/templates/desktop-automation/add-datetime-to-file-names/fixtures'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask Folder', {
      inTitle: Custom('Add datetime to file names'),
      inText: Custom(
        'Please, select the parent folder of the files you want to rename. Press Cancel to exit.'
      ),
      optDefault: Message('default_folder'),
      outText: Message('selected_folder'),
    })
    .then('a10003', 'Core.Programming.Function', 'Branch On Cancel', {
      outputs: 2,
      func: `return (msg.selected_folder && msg.selected_folder.trim()) ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.FileSystem.List', 'List Folder', {
    inDirPath: Message('selected_folder'),
    optAbsolutePath: true,
    optSize: true,
    optIsDir: true,
    optCreateTime: true,
    optTop: 0,
    outFiles: Message('files_to_rename'),
  })
    .then('a10005', 'Core.Flow.GoTo', 'Enter Loop', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10010', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10011', 'Core.Programming.ForEach', 'For Each File', {
      optInput: Message('files_to_rename'),
      optOutput: Message('current_file'),
    });

  f.node('a10012', 'Core.Programming.Function', 'Skip Dirs And Stamped', {
    outputs: 2,
    func: `var f = msg.current_file || {}; if (f.IsDir) return [null, msg]; msg.source_path = f.Name; msg.create_time = f.CreateTime; if (/-\\d{8}\\./.test(f.Name)) return [null, msg]; return [msg, null];`,
  });

  f.node('a10013', 'Robomotion.DateTime.Format', 'Format Stamp', {
    inTime: Message('create_time'),
    optInLayout: 'RFC3339',
    optOutLayout: 'Custom',
    optCustomOutLayout: Custom('20060102'),
    outFormattedTime: Message('stamp'),
  })
    .then('a10014', 'Core.Programming.Function', 'Build New Path', {
      func: `var p = msg.source_path; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); var dir = p.substring(0, lastSlash); var base = p.substring(lastSlash + 1); var dot = base.lastIndexOf('.'); var stem = dot === -1 ? base : base.substring(0, dot); var ext = dot === -1 ? '' : base.substring(dot); msg.target_path = dir + '/' + stem + '-' + msg.stamp + ext; return msg;`,
    })
    .then('a10015', 'Core.FileSystem.PathExists', 'Target Exists?', {
      inPath: Message('target_path'),
      outResult: Message('target_exists'),
    })
    .then('a10016', 'Core.Programming.Function', 'Skip Or Rename', {
      outputs: 2,
      func: `return msg.target_exists ? [null, msg] : [msg, null];`,
    });

  f.node('a10017', 'Core.FileSystem.Move', 'Rename File', {
    inSrcPath: Message('source_path'),
    inDestPath: Message('target_path'),
    continueOnError: true,
  })
    .then('a10018', 'Core.Flow.GoTo', 'Loop Back After Rename', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10019', 'Core.Flow.GoTo', 'Loop Back Skip', {
    optNodes: { type: 'goto', ids: ['a10010'], all: false },
  });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10011', 0, 'a10012', 0);
  f.edge('a10011', 1, 'a10099', 0);
  f.edge('a10012', 0, 'a10013', 0);
  f.edge('a10012', 1, 'a10019', 0);
  f.edge('a10016', 0, 'a10017', 0);
  f.edge('a10016', 1, 'a10019', 0);
});

myFlow.start();
