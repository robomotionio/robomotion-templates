import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Click', (f) => {
  f.node('8296bd', 'Core.Flow.Begin', 'Begin', {})
    .then('2076cf', 'Core.Programming.Function', 'Function', {
    func: 'var operator = msg.row[\'Operator\'];\nif (operator == \'/\') {\n  msg.automation_id = \'divideButton\';\n  msg.name = \'Divide by\';\n}\nelse if (operator == \'*\') {\n  msg.automation_id = \'multiplyButton\';\n  msg.name = \'Multiply by\';\n}\nelse if (operator == \'-\') {\n  msg.automation_id = \'minusButton\';\n  msg.name = \'Minus\';\n}\nelse if (operator == \'+\') {\n  msg.automation_id = \'plusButton\';\n  msg.name = \'Plus\';\n}\nreturn msg;'
  });
  f.node('721f5f', 'Robomotion.WinAccess.Click', 'Click', {
    inTitle: Custom('Calculator'),
    inAutomationID: Message('automation_id'),
    inElementName: Message('name'),
    inClassName: Custom('Button'),
    inControlType: Custom('2'),
    inHWND: 0
  });
  f.node('fe0296', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('2076cf', 0, '721f5f', 0);
  f.edge('fe0296', 0, '721f5f', 0);
});
