import { subflow, Message } from '@robomotion/sdk';

subflow.create('Function', (f) => {
  f.node('81ce45', 'Core.Flow.Begin', 'Begin', {})
    .then('cdeb82', 'Core.Programming.Function', 'Function', {
    func: 'msg.pages = parseInt(Math.ceil(msg.table.rows.length / msg.per_page));\n\nvar delimiter = msg.csv_path.includes(\'/\') ? \'/\' : \'\\\\\';\nmsg.file_name = msg.csv_path.split(delimiter).slice(-1)[0];\n\nmsg.page_keys = Array.from(Array(msg.pages).keys());\nreturn msg;'
  })
    .then('83e7e6', 'Core.FileSystem.PathExists', 'Output Dir Exists', {
    inPath: Message('out_dir'),
    outResult: Message('exists')
  })
    .then('85eab2', 'Core.Programming.Switch', 'Check Output Dir', {
    outputs: 2,
    optConditions: ['msg.exists', '!msg.exists']
  });
  f.node('5d1748', 'Core.FileSystem.Create', 'Create Output Dir', {
    inPath: Message('out_dir'),
    outPath: Message('path'),
    optType: 'directory'
  });
  f.node('393f6b', 'Core.Programming.ForEach', 'For Each Row Part', {
    outputs: 2,
    optInput: Message('page_keys'),
    optOutput: Message('page_key')
  });
  f.node('ec2dc2', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('64b00f', 'Core.Flow.Label', 'Next Page', {});
  f.node('c2653d', 'Core.FileSystem.Create', 'Create CSV File', {
    inPath: Message('file_path'),
    outPath: Message('path'),
    optType: 'file'
  });
  f.node('8a8cc0', 'Core.Programming.Switch', 'Check CSV File', {
    outputs: 2,
    optConditions: ['msg.exists', '!msg.exists']
  });
  f.node('f3cb06', 'Core.Programming.Function', 'Function', {
    func: 'var rows = msg.table.rows.slice(msg.page_key*msg.per_page, (msg.page_key+1)*msg.per_page);\n\nvar arr = msg.file_name.split(\'.\');\narr.splice(1, 0, `${msg.page_key+1}_of_${msg.pages}`);\nvar file = `${arr[0]}_${arr[1]}.${arr[2]}`;\nmsg.file_path = `${msg.out_dir}/${file}`;\n\nmsg.sub_table = {columns: msg.table.columns, rows: rows};\nreturn msg;'
  })
    .then('9afc1c', 'Core.FileSystem.PathExists', 'CSV Exists', {
    inPath: Message('file_path'),
    outResult: Message('exists')
  });
  f.node('7b1780', 'Core.Flow.GoTo', 'Go To Next Page', { optNodes: { ids: ['64b00f'], type: 'goto', all: false } });
  f.node('ddc4d4', 'Core.CSV.WriteCSV', 'Write CSV', {
    inFilePath: Message('file_path'),
    inTable: Message('sub_table'),
    optSeparator: 'semicolon',
    optEncoding: 'utf8'
  });

  f.edge('85eab2', 1, '5d1748', 0);
  f.edge('85eab2', 0, '393f6b', 0);
  f.edge('393f6b', 0, '5d1748', 0);
  f.edge('393f6b', 1, 'ec2dc2', 0);
  f.edge('393f6b', 0, 'f3cb06', 0);
  f.edge('9afc1c', 0, '8a8cc0', 0);
  f.edge('8a8cc0', 0, 'ddc4d4', 0);
  f.edge('8a8cc0', 1, 'c2653d', 0);
  f.edge('c2653d', 0, 'ddc4d4', 0);
  f.edge('64b00f', 0, '393f6b', 0);
  f.edge('ddc4d4', 0, '7b1780', 0);
});
