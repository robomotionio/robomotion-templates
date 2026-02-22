import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('For Each Digit', (f) => {
  f.node('91d030', 'Core.Trigger.Catch', 'Catch', { optNodes: { ids: ['b13d14'], type: 'goto', all: false } });
  f.node('f04703', 'Core.Flow.Begin', 'Begin', {});
  f.node('4519cb', 'Core.Flow.Label', 'Operand 1', {});
  f.node('9c84de', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('2d7ac0', 'Core.Programming.ForEach', 'For Each Digit', {
    outputs: 2,
    optInput: Message('digits1'),
    optOutput: Message('digit')
  });
  f.node('b13d14', 'Core.Programming.Function', 'Get Digit', {
    func: 'var names = [\'Zero\', \'One\', \'Two\', \'Three\', \'Four\', \'Five\', \'Six\', \'Seven\', \'Eight\', \'Nine\'];\nmsg.automation_id = `num${msg.digit}Button`;\nmsg.name = names[msg.digit];\nconsole.log(msg);\nreturn msg;'
  });
  f.node('779908', 'Robomotion.WinAccess.Click', 'Click Digit', {
    inTitle: Custom('Calculator'),
    inAutomationID: Message('automation_id'),
    inElementName: Message('name'),
    inClassName: Custom('Button'),
    inControlType: Custom('2'),
    inHWND: 0
  })
    .then('2d93d2', 'Core.Flow.GoTo', 'Go To Operand 1', { optNodes: { ids: ['4519cb'], type: 'goto', all: false } });

  f.edge('b13d14', 0, '2d7ac0', 0);
  f.edge('2d7ac0', 0, '4519cb', 0);
  f.edge('f04703', 0, '2d7ac0', 0);
  f.edge('2d7ac0', 1, '9c84de', 0);
  f.edge('2d93d2', 0, '91d030', 0);
  f.edge('b13d14', 0, '779908', 0);
});
