import { subflow, Message } from '@robomotion/sdk';

subflow.create('For Each', (f) => {
  f.node('a615ec', 'Core.Flow.Label', 'Next Message', {});
  f.node('655c37', 'Core.Flow.Begin', 'Begin', {});
  f.node('18ee25', 'Core.Programming.ForEach', 'For Each', {
    outputs: 2,
    optInput: Message('batch'),
    optOutput: Message('number')
  });
  f.node('e20ec1', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('e43678', 'Core.Flow.GoTo', 'Go To Next Message', { optNodes: { ids: ['a615ec'], type: 'goto', all: false } });
  f.node('a83106', 'Robomotion.Slack.SendMessage', 'Send Message', {
    inChannelName: Message('channel_name'),
    inClientID: Message('client_id'),
    inMessage: Message('message')
  });
  f.node('4ab8fd', 'Core.Programming.Function', 'Prepare Message', { func: 'msg.message = "Number: " + msg.number\nreturn msg;' });

  f.edge('655c37', 0, '18ee25', 0);
  f.edge('18ee25', 0, 'a615ec', 0);
  f.edge('e20ec1', 0, '18ee25', 1);
  f.edge('18ee25', 0, '4ab8fd', 0);
  f.edge('4ab8fd', 0, 'a83106', 0);
  f.edge('a83106', 0, 'e43678', 0);
});
