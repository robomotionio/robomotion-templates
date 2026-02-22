import { flow, Message } from '@robomotion/sdk';

flow.create('f3949d80-010c-4272-99bd-294d830aaa9f', 'Process Tasks Parallely', (f) => {
  f.node('a4c7a9', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Process Tasks Parallely \n\nThis template exemplifies how sequential tasks are done as parallely in shorter time. In this sample, the task is sending messages to Slack with task number. The messages are sent to Slack as unordered since it runs paralely. If it would run sequentially, the messages would send ordered, but in longer time\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.task_count field with the number of task you want to test\n\n**3.** Update msg.branch_count field with the number of branch you want to run parallely\n\n**4.** Update msg.channel_name field with the name of the Slack channel you want to send messages\n\n**5.** Set the slack environment by following [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration) instructions.\n\n**6.** Set credentials to the item you created in step 3 for **Connect To Slack** node'
  });
  f.node('ad98f9', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Note\n Takes takes as batches and handles them parallely'
  });
  f.node('9610d3', 'Core.Trigger.Inject', 'Start', {})
    .then('2979a1', 'Core.Programming.Function', 'Config', {
    func: 'msg.task_count = 21; //[Required] The total number of message elements\nmsg.branch_count = 5; //[Required] The number of branches that will run paralely\nmsg.channel_name = "slack-package" //[Required] The name of the slack channel that the messages will send\nreturn msg;'
  })
    .then('f732e0', 'Core.Programming.Function', 'Create Sample Array', {
    func: 'var numbers = Array.from(Array(msg.task_count), (_, index) => index + 1);//Sample array is created for sending messages\nmsg.batches = [];\n\nfor(var i = 0; i < msg.branch_count; i++){\n  msg.batches.push(new Array())\n}\n\nfor(var i = 0; i < numbers.length;){\n  console.log(i)\n  for(var j = 0; j < msg.branch_count && i < numbers.length; j++){\n      msg.batches[j].push(numbers[i])\n     i++;\n  }\n}\nreturn msg;'
  })
    .then('c32ddb', 'Robomotion.Slack.Connect', 'Connect To Slack', { outClientID: Message('client_id') });
  f.node('4c23e8', 'Core.Flow.Label', 'Next Batch', {});
  f.node('f78232', 'Core.Programming.ForEach', 'For Each', {
    outputs: 2,
    optInput: Message('batches'),
    optOutput: Message('batch')
  });
  f.node('a6cadc', 'Core.Flow.GoTo', 'Go To Next Batch', { optNodes: { ids: ['4c23e8'], type: 'goto', all: false } });
  f.node('287ebf', 'Core.Flow.SubFlow', 'Send Message', { subflow: 'e073af8d-cc48-49b3-84fd-f988f2ae4494' });

  f.edge('f78232', 0, 'a6cadc', 0);
  f.edge('f78232', 0, '287ebf', 0);
  f.edge('4c23e8', 0, 'f78232', 0);
  f.edge('c32ddb', 0, 'f78232', 0);
}).start();
