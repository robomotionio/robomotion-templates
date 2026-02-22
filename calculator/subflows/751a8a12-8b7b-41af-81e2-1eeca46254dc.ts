import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('For Each Row', (f) => {
  f.node('9bf280', 'Core.Flow.Begin', 'Begin', {});
  f.node('623210', 'Core.Flow.Label', 'Next Row', {});
  f.node('7710e0', 'Robomotion.WinAccess.Click', 'Close Calculator', {
    inTitle: Custom('Calculator'),
    inAutomationID: Custom('Close'),
    inElementName: Custom('[a-zA-Z]*'),
    inClassName: {"scope": "Custom"},
    inControlType: Custom('2'),
    inHWND: 0,
    image: 'https://api.robomotion.io/v1/flows.files.get?type=image&path=flows/24c45e56-1e2b-4299-8260-c4acc45362ad/images/4a7e0023-d6e1-457b-9a52-25833dff22c3.png'
  })
    .then('100427', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('9ff882', 'Core.Programming.ForEach', 'For Each Row', {
    outputs: 2,
    optInput: Message('table.rows'),
    optOutput: Message('row')
  });
  f.node('26a3ce', 'Core.Programming.Function', 'Process Row', {
    func: 'var names = [\'Zero\', \'One\', \'Two\', \'Three\', \'Four\', \'Five\', \'Six\', \'Seven\', \'Eight\', \'Nine\'];\n\nvar operand1 = \'\'+parseInt(msg.row[\'Operand 1\']);\nvar operand2 = \'\'+parseInt(msg.row[\'Operand 2\']);\nmsg.digits1 = operand1.split(\'\');\nmsg.digits2 = operand2.split(\'\');\n\nreturn msg;'
  });
  f.node('4aa4fe', 'Core.Flow.SubFlow', 'Type Operand 1', { subflow: 'db53f35d-08a6-4a0f-9450-147d02ec0c74' });
  f.node('73894e', 'Core.Flow.SubFlow', 'Type Operand 2', { subflow: '7e3f4941-8bf1-4bd5-87de-0f51eddb9a99' });
  f.node('f48b01', 'Core.Flow.SubFlow', 'Set Result', { subflow: 'd64bc5d5-8fe1-473d-b301-0366ac61d193' });
  f.node('688506', 'Core.Flow.SubFlow', 'Operator', { subflow: '2539b384-89c9-4e46-abf8-b1c503e8718b' });
  f.node('0c78dd', 'Core.Flow.GoTo', 'Go To Next Row', { optNodes: { ids: ['623210'], type: 'goto', all: false } });

  f.edge('26a3ce', 0, '9ff882', 0);
  f.edge('9ff882', 0, '623210', 0);
  f.edge('9bf280', 0, '9ff882', 0);
  f.edge('4aa4fe', 0, '26a3ce', 0);
  f.edge('4aa4fe', 0, '688506', 0);
  f.edge('688506', 0, '73894e', 0);
  f.edge('73894e', 0, 'f48b01', 0);
  f.edge('0c78dd', 0, 'f48b01', 0);
  f.edge('9ff882', 1, '7710e0', 0);
});
