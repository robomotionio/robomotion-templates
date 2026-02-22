import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('65b3f54f-222d-4d19-97a2-feb0fc6e6327', 'Write to Word Document', (f) => {
  f.node('bce76c', 'Core.Flow.Comment', 'Comment', {
    optText: '## Write to Word Document\n\nThis template uses *Microsoft Word* nodes for write text to a new word document. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Microsoft Word package icon, install it.\n\n**3.** Edit the Config Node.\n'
  });
  f.node('814cb7', 'Core.Trigger.Inject', 'Start', {})
    .then('eb13a2', 'Core.Programming.Function', 'Config', {
    func: 'msg.txtpath = "C:/Users/user/Documents/sample.txt"; //Path of txt file for read the content.\nmsg.newwordpath = "C:/Users/user/Documents/sample.docx";//Path of document to create.\nmsg.fontsize = 12; //Size of word text.\nreturn msg;'
  })
    .then('f8301d', 'Core.FileSystem.ReadFile', 'Read File', {
    inPath: Message('txtpath'),
    outContent: Message('text')
  })
    .then('1dd180', 'Robomotion.MicrosoftWord.CreateWord', 'Create Word', { path: Message('newwordpath') })
    .then('59a1e8', 'Robomotion.MicrosoftWord.OpenWord', 'Open Word', {
    path: Message('newwordpath'),
    outApplicationId: Message('word_fd'),
    optVisible: true
  })
    .then('8c8481', 'Robomotion.MicrosoftWord.AddText', 'Add Text', {
    applicationId: Message('word_fd'),
    text: Message('text'),
    size: Message('fontsize'),
    spaceAfter: Custom('0'),
    fontName: Custom('Times New Roman')
  })
    .then('0fb74e', 'Robomotion.MicrosoftWord.CloseWord', 'Close Word', {
    applicationId: Message('word_fd'),
    saveAsPath: Custom(''),
    optSaveChanges: true,
    saveAs: '_'
  })
    .then('3dd874', 'Core.Flow.Stop', 'Stop', {});
}).start();
