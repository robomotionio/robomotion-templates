import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Excel', (f) => {
  f.node('de92e2', 'Core.Excel.Open', 'Open Excel', {
    inPath: Message('excel_path'),
    outFileDescriptor: Message('excel_fd'),
    optCreate: true
  })
    .then('56618c', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A1'),
    inValue: Custom('Channel Name'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('fcebe6', 'Core.Flow.Begin', 'Begin', {});
  f.node('af1bef', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A7'),
    inValue: Custom('Location'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('cd900c', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A8'),
    inValue: Custom('Channel\'s Avatar Link'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('90bf5a', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A9'),
    inValue: Custom('Related Link 1'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('e47e06', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A10'),
    inValue: Custom('Related Link 2'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('e93e0f', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A11'),
    inValue: Custom('Related Link 3'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('1536fa', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A12'),
    inValue: Custom('Related Link 4'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('34ef95', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A6'),
    inValue: Custom('Description'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('48653b', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A5'),
    inValue: Custom('Total Views'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('83f5ef', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A4'),
    inValue: Custom('Number of Subscribers'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('53b52a', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A3'),
    inValue: Custom('The Date Channel was created'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('46b304', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A2'),
    inValue: Custom('Channel Link'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('ed5cb9', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A14'),
    inValue: Custom('Related Link 6'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('bc98f7', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('A13'),
    inValue: Custom('Related Link 5'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('7cd2e8', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B7'),
    inValue: Message('location'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('cdd46d', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B8'),
    inValue: Message('result.avatarLink'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('fcccfe', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B9'),
    inValue: Message('link1.link1'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('54b2de', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B10'),
    inValue: Message('link2.link2'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('64e942', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B11'),
    inValue: Message('link3.link3'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('a5e5e7', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B12'),
    inValue: Message('link4.link4'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('a2d560', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B6'),
    inValue: Message('description'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('8c4093', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B4'),
    inValue: Message('numOfSubs'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  })
    .then('de856a', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B5'),
    inValue: Message('views'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('7423af', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B3'),
    inValue: Message('date'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('b33e14', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B2'),
    inValue: Message('url'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('7e1904', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B1'),
    inValue: Message('channelName'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('9233c7', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B13'),
    inValue: Message('link5.link5'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('77334e', 'Core.Excel.SetCellValue', 'Set Cell Value', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B14'),
    inValue: Message('link6.link6'),
    optTarget: 'specific-cell',
    optFormat: 'string'
  });
  f.node('735299', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('8f9f91', 'Core.Excel.Save', 'Save Excel', {
    inFileDescriptor: Message('excel_fd'),
    inSaveFilePath: Message('excel_path')
  });

  f.edge('56618c', 0, '46b304', 0);
  f.edge('53b52a', 0, '83f5ef', 0);
  f.edge('83f5ef', 0, '48653b', 0);
  f.edge('48653b', 0, '34ef95', 0);
  f.edge('8f9f91', 0, '735299', 0);
  f.edge('53b52a', 0, '46b304', 0);
  f.edge('1536fa', 0, 'bc98f7', 0);
  f.edge('7e1904', 0, 'b33e14', 0);
  f.edge('b33e14', 0, '7423af', 0);
  f.edge('7423af', 0, '8c4093', 0);
  f.edge('de856a', 0, 'a2d560', 0);
  f.edge('a5e5e7', 0, '9233c7', 0);
  f.edge('ed5cb9', 0, '7e1904', 0);
  f.edge('ed5cb9', 0, 'bc98f7', 0);
  f.edge('77334e', 0, '9233c7', 0);
  f.edge('77334e', 0, '8f9f91', 0);
  f.edge('34ef95', 0, 'af1bef', 0);
  f.edge('a2d560', 0, '7cd2e8', 0);
  f.edge('fcebe6', 0, 'de92e2', 0);
});
