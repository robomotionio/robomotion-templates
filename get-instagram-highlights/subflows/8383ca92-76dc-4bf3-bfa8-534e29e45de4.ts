import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('For Each', (f) => {
  f.node('95b354', 'Core.FileSystem.Create', 'Create Highlight Dir', {
    inPath: Message('highlight_path'),
    outPath: Message('highlight_path'),
    optType: 'directory',
    continueOnError: true
  });
  f.node('887b98', 'Core.Programming.Function', 'Settings', {
    func: 'var title = msg.highlight.title;\nmsg.highlight_path = msg.profile_root + msg.os_splitter +  title;\nmsg.counter = 0;\nreturn msg;'
  });
  f.node('6d18c9', 'Core.Flow.Begin', 'Begin', {});
  f.node('4e5c24', 'Core.Flow.Label', 'Next Highlight Story', {});
  f.node('040f27', 'Core.Programming.ForEach', 'For Each', {
    outputs: 2,
    optInput: Message('highlight.highlight_stories'),
    optOutput: Message('highlight_story')
  });
  f.node('9c824e', 'Core.Programming.Function', 'Set Filename', {
    func: 'msg.counter++;\nvar extension = msg.highlight_story.url.split("?")[0].split(".").pop();\nmsg.download_path = msg.highlight_path + msg.os_splitter + msg.counter + "." +  extension;\nreturn msg;'
  });
  f.node('5ea8d8', 'Core.Flow.GoTo', 'Go To Next Highlight Story', { optNodes: { ids: ['4e5c24'], type: 'goto', all: false } });
  f.node('e71ef6', 'Core.Net.Download', 'Download File', {
    inUrl: Message('highlight_story.url'),
    inPath: Message('download_path'),
    outPath: Message('path'),
    optPattern: Custom(''),
    optTimeout: 60
  });
  f.node('66faff', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('e71ef6', 0, '9c824e', 0);
  f.edge('040f27', 0, '9c824e', 0);
  f.edge('e71ef6', 0, '5ea8d8', 0);
  f.edge('040f27', 1, '66faff', 0);
  f.edge('040f27', 0, '4e5c24', 0);
  f.edge('95b354', 0, '040f27', 0);
  f.edge('6d18c9', 0, '887b98', 0);
  f.edge('95b354', 0, '887b98', 0);
});
