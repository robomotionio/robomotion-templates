import { subflow, Message } from '@robomotion/sdk';

subflow.create('For Each', (f) => {
  f.node('cdac32', 'Core.Flow.Begin', 'Begin', {})
    .then('5be87f', 'Robomotion.Slack.Connect', 'Connect', { outClientID: Message('client_id') })
    .then('487685', 'Core.Programming.ForEach', 'For Each', {
    outputs: 2,
    optInput: Message('table.rows'),
    optOutput: Message('row')
  });
  f.node('fb8ee5', 'Core.Flow.Label', 'Next Birthdate', {});
  f.node('288618', 'Core.Programming.Function', 'Is Employees\' Birthdate ?', {
    outputs: 2,
    func: '//Returns current date with specific format\nfunction getCurrentDate(){\n  var date = new Date();\n  var day = ("00"+ date.getDate()).slice(-2);\n  var month = ("00"+ (date.getMonth() + 1)).slice(-2);\n  return day + "." + month;\n}\n\nvar currentDate = getCurrentDate();\nvar temp = msg.row.birthdate.split(".");\nvar employeeBirthDate = temp[0] + "." + temp[1]\n\nconsole.log(currentDate)\nif (currentDate === employeeBirthDate){\n  msg.message = "Happy birthday *" + msg.row.name + " " + msg.row.surname + "*:tada: \\n";\n  msg.message += "We are happy to work with you.:blush:\\n";\n  msg.message += "We hope we will celebrate your next birthday together:muscle:\\n";\n  return [msg, null];\n  \n}\n\nreturn [null, msg];'
  });
  f.node('99ef6a', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('0576a6', 'Robomotion.Slack.SendMessage', 'Send Message', {
    inChannelName: Message('channel_name'),
    inClientID: Message('client_id'),
    inMessage: Message('message')
  });
  f.node('b416e8', 'Core.Flow.GoTo', 'Go To Next Birthdate', { optNodes: { ids: ['fb8ee5'], type: 'goto', all: false } });

  f.edge('487685', 0, 'fb8ee5', 0);
  f.edge('487685', 1, '99ef6a', 0);
  f.edge('487685', 0, '288618', 0);
  f.edge('288618', 1, 'b416e8', 0);
  f.edge('288618', 0, '0576a6', 0);
  f.edge('0576a6', 0, 'b416e8', 0);
});
