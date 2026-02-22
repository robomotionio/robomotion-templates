import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('efae21bf-8413-408f-bc3f-4150c7dec2e0', 'Stock Prices', (f) => {
  f.node('120b57', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Stock Prices How-To\n \n This template uses Excel and Browser nodes to update stock prices in an Excel file.\n \n1. Edit Config (Function) node\n\n2. Download the sample excel file from [here](https://github.com/robomotionio/robomotion-templates/raw/master/files/stocks.xlsx)\n\n3. Set the msg.excel_path field to the path you downloaded the Excel file\n'
  });
  f.node('051fd6', 'Core.Trigger.Inject', 'Start', {})
    .then('061184', 'Core.Programming.Function', 'Config', {
    func: '// This is for Linux\nmsg.excel_path = "/home/jane/stocks.xlsx";\n\n// This is for Mac\n// msg.excel_path = "/Users/jane/stocks.xlsx";\n\n// This is for Windows\n// msg.excel_path = "C:\\\\Users\\jane\\\\stocks.xlsx";\n\nreturn msg;\n'
  })
    .then('4ec016', 'Core.Excel.Open', 'Open Stocks Escel', {
    inPath: Message('excel_path'),
    outFileDescriptor: Message('excel_fd'),
    optCreate: false
  })
    .then('11b728', 'Core.Excel.GetRange', 'Read All Symbols', {
    inFileDescriptor: Message('excel_fd'),
    inFromCell: Custom(''),
    inToCell: Custom(''),
    outRange: Message('table'),
    optTarget: 'all-range',
    optHeaders: true,
    optJsonify: true
  })
    .then('5d3592', 'Core.Excel.SetActiveCell', 'Set Active Cell', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom('B2'),
    optTarget: 'specific'
  })
    .then('023315', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  });
  f.node('b154e5', 'Core.Flow.Label', 'Next Symbol', {});
  f.node('a93a8a', 'Core.Programming.ForEach', 'For Each Symbol', {
    outputs: 2,
    optInput: Message('table.rows'),
    optOutput: Message('stock')
  });
  f.node('0eed66', 'Core.Excel.Save', 'Save Excel', {
    inFileDescriptor: Message('excel_fd'),
    inSaveFilePath: Custom('')
  })
    .then('887a10', 'Core.Flow.Stop', 'Stop', {});
  f.node('1a4a53', 'Core.Flow.SubFlow', 'Get Stock Price', { subflow: '0badf04f-27fb-477c-97c1-7a1cc6f9ce41' })
    .then('02b973', 'Core.Excel.SetCellValue', 'Write Stock Price', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom(''),
    inValue: Message('value'),
    optTarget: 'active-cell',
    optFormat: 'number'
  })
    .then('888da0', 'Core.Excel.SetActiveCell', 'Set Active Cell', {
    inFileDescriptor: Message('excel_fd'),
    inCell: Custom(''),
    optTarget: 'down'
  })
    .then('ac488c', 'Core.Flow.GoTo', 'Go To Next Symbol', { optNodes: { ids: ['b154e5'], type: 'goto', all: false } });

  f.edge('023315', 0, 'a93a8a', 0);
  f.edge('a93a8a', 0, '1a4a53', 0);
  f.edge('a93a8a', 1, '0eed66', 0);
  f.edge('b154e5', 0, 'a93a8a', 0);
}).start();
