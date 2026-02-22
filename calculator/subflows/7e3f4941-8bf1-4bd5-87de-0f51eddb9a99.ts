import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('For Each Digit', (f) => {
  f.node('4fc509', 'Core.Flow.Begin', 'Begin', {});
  f.node('aca546', 'Core.Flow.Label', 'Operand 2', {});
  f.node('9ca0e5', 'Core.Programming.ForEach', 'For Each Digit', {
    outputs: 2,
    optInput: Message('digits2'),
    optOutput: Message('digit')
  });
  f.node('e974c1', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('19c93a', 'Core.Programming.Function', 'Get Digit', {
    func: 'var names = [\'Zero\', \'One\', \'Two\', \'Three\', \'Four\', \'Five\', \'Six\', \'Seven\', \'Eight\', \'Nine\'];\nmsg.automation_id = `num${msg.digit}Button`;\nmsg.name = names[msg.digit];\nreturn msg;'
  });
  f.node('79e2e1', 'Robomotion.WinAccess.Click', 'Click', {
    inTitle: Custom('Calculator'),
    inAutomationID: Message('automation_id'),
    inElementName: Message('name'),
    inClassName: Custom('Button'),
    inControlType: Custom('2'),
    inHWND: 0
  });
  f.node('2105a4', 'Core.Flow.GoTo', 'Go To Operand 2', { optNodes: { ids: ['aca546'], type: 'goto', all: false } });

  f.edge('19c93a', 0, '9ca0e5', 0);
  f.edge('9ca0e5', 0, 'aca546', 0);
  f.edge('79e2e1', 0, '19c93a', 0);
  f.edge('2105a4', 0, '79e2e1', 0);
  f.edge('4fc509', 0, '9ca0e5', 0);
  f.edge('9ca0e5', 1, 'e974c1', 0);
});
