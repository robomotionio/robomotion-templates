import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Click =', (f) => {
  f.node('f39f56', 'Core.Flow.Begin', 'Begin', {})
    .then('a1f252', 'Robomotion.WinAccess.Click', 'Click =', {
    inTitle: Custom('Calculator'),
    inAutomationID: Custom('equalButton'),
    inElementName: Custom('Equals'),
    inClassName: Custom('Button'),
    inControlType: Custom('2'),
    inHWND: 0,
    image: 'https://api.robomotion.io/v1/flows.files.get?type=image&path=flows/24c45e56-1e2b-4299-8260-c4acc45362ad/images/a862c2d9-811c-418c-b5fb-b1125af31918.png'
  })
    .then('472dba', 'Robomotion.WinAccess.GetText', 'Get Display', {
    inTitle: Custom('Calculator'),
    inAutomationID: Custom('CalculatorResults'),
    inElementName: Custom('Display is *'),
    inClassName: {"scope": "Custom"},
    inControlType: Custom('34'),
    inHWND: 0,
    image: 'https://api.robomotion.io/v1/flows.files.get?type=image&path=flows/f83c37a0-243d-4817-9b11-5df005d3a2a7/images/5865f1c6-8ec1-47e0-a840-5eb7efdec498.png',
    previewHidden: false,
    outText: Message('result')
  })
    .then('fac660', 'Core.Programming.Function', 'Get Result', {
    func: 'msg.result = msg.result.replace(\'Display is \', \'\');\nmsg.cell = \'D\'+msg.row_index;\nmsg.row_index++;\nreturn msg;'
  });
  f.node('b2aa3a', 'Robomotion.MicrosoftExcel.SetCellValue', 'Set Cell Value', {
    applicationId: Message('excel_fd'),
    cell: Message('cell'),
    value: Message('result'),
    mod1: 'number'
  })
    .then('25d5ee', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('5741d5', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });

  f.edge('fac660', 0, '5741d5', 0);
  f.edge('fac660', 0, 'b2aa3a', 0);
});
