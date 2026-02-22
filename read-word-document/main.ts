import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('2512c2b1-a558-47a8-8814-76999edab97e', 'Read Word Document', (f) => {
  f.node('10605c', 'Core.Flow.Comment', 'Comment', {
    optText: '## Read Word Document\n\nThis template uses *Microsoft Word* nodes for read the content of a word document. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Microsoft Word package icon, install it.\n\n**3.** Edit the Config Node.\n\n**4.** Set the msg.path to the path of word file.\n'
  });
  f.node('edaecb', 'Core.Trigger.Inject', 'Start', {})
    .then('04673a', 'Core.Programming.Function', 'Config', {
    func: 'msg.path = "C:/Users/user/Desktop/sampleword.docx"; // Path of word document.\nreturn msg;'
  })
    .then('f158fe', 'Robomotion.MicrosoftWord.OpenWord', 'Open Word', {
    path: Message('path'),
    outApplicationId: Message('word_fd'),
    optVisible: true
  })
    .then('98669d', 'Robomotion.MicrosoftWord.ReadWord', 'Read Word', {
    applicationId: Message('word_fd'),
    text: Message('text')
  });
  f.node('2f2e35', 'Robomotion.MicrosoftWord.CloseWord', 'Close Word', {
    applicationId: Message('word_fd'),
    saveAsPath: Custom(''),
    optSaveChanges: false,
    saveAs: '_'
  })
    .then('e1f3d9', 'Core.Flow.Stop', 'Stop', {});
  f.node('d475da', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });

  f.edge('98669d', 0, '2f2e35', 0);
  f.edge('98669d', 0, 'd475da', 0);
}).start();
