import { subflow, Message } from '@robomotion/sdk';

subflow.create('For Each Highlight', (f) => {
  f.node('6653a7', 'Core.Flow.Label', 'Next Story', {});
  f.node('0820fa', 'Core.Flow.Begin', 'Begin', {})
    .then('0fba59', 'Core.Programming.Function', 'Setup', {
    func: 'msg.profile_root = msg.root_path + msg.profile;\nreturn msg;'
  });
  f.node('dfbd43', 'Core.FileSystem.Create', 'Create Profile Dir', {
    inPath: Message('profile_root'),
    outPath: Message('path'),
    optType: 'directory',
    continueOnError: true
  });
  f.node('30bdc7', 'Core.Programming.ForEach', 'For Each Highlight', {
    outputs: 2,
    optInput: Message('highlights'),
    optOutput: Message('highlight')
  });
  f.node('bc7c0d', 'Robomotion.Instagram.GetHighlights', 'Get Highlights', {
    inClientId: Message('instagram_id'),
    inUserName: Message('profile'),
    outMessage: Message('highlights')
  });
  f.node('354cbd', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('598d0e', 'Core.Flow.SubFlow', 'Download Highlight Stories', { subflow: '8383ca92-76dc-4bf3-bfa8-534e29e45de4' })
    .then('38a757', 'Core.Flow.GoTo', 'Go To Next Story', { optNodes: { ids: ['6653a7'], type: 'goto', all: false } });

  f.edge('0fba59', 0, 'dfbd43', 0);
  f.edge('30bdc7', 0, '6653a7', 0);
  f.edge('30bdc7', 1, '354cbd', 0);
  f.edge('bc7c0d', 0, 'dfbd43', 0);
  f.edge('bc7c0d', 0, '30bdc7', 0);
  f.edge('30bdc7', 0, '598d0e', 0);
});
