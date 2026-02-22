import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Download File', (f) => {
  f.node('35374a', 'Core.Flow.Label', 'Next Story', {});
  f.node('61e6ad', 'Core.Flow.Begin', 'Begin', {})
    .then('210c5c', 'Core.Programming.Function', 'Setup', {
    func: 'msg.profile_root = msg.root_path + msg.profile;\nreturn msg;'
  })
    .then('a32974', 'Core.FileSystem.Create', 'Create Profile Dir', {
    inPath: Message('profile_root'),
    outPath: Message('path'),
    optType: 'directory',
    continueOnError: true
  })
    .then('3cf83d', 'Robomotion.Instagram.GetStories', 'Get Stories', {
    inClientId: Message('instagram_id'),
    inUserName: Message('profile'),
    outMessage: Message('stories')
  });
  f.node('32ffcf', 'Core.Programming.ForEach', 'For Each Story', {
    outputs: 2,
    optInput: Message('stories'),
    optOutput: Message('story')
  });
  f.node('e14c3b', 'Core.Programming.Function', 'Set Filename', {
    func: 'var extension = msg.story.url.split("?")[0].split(".").pop();\nvar file = msg.story.created_at.replace(" ", "-").replace(/:/g, "-") + "." + extension;\nmsg.story_path = msg.profile_root + "/" + file;\nreturn msg;'
  });
  f.node('d695d5', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('a41e94', 'Core.Programming.Debug', 'Debug', {
    optActive: true,
    optSysConsole: true,
    optDebugData: Message('')
  });
  f.node('ff0e4e', 'Core.Net.Download', 'Download File', {
    inUrl: Message('story.url'),
    inPath: Message('story_path'),
    outPath: Message('path'),
    optPattern: Custom(''),
    optTimeout: 60
  });
  f.node('d4ff3a', 'Core.Flow.GoTo', 'Go To Next Story', { optNodes: { ids: ['35374a'], type: 'goto', all: false } });

  f.edge('ff0e4e', 0, 'e14c3b', 0);
  f.edge('3cf83d', 0, '32ffcf', 0);
  f.edge('e14c3b', 0, '32ffcf', 0);
  f.edge('ff0e4e', 0, 'd4ff3a', 0);
  f.edge('32ffcf', 0, '35374a', 0);
  f.edge('32ffcf', 1, 'd695d5', 0);
  f.edge('3cf83d', 0, 'a41e94', 0);
});
