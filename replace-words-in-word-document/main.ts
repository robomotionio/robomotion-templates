import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('18b19e4d-6bda-4403-8c56-dd45849b42a9', 'Replace Words in Word Document', (f) => {
  f.node('b35178', 'Core.Flow.Comment', 'Comment', {
    optText: '## Replace Words in Word Document\n\nThis template uses *Microsoft Word* nodes for replace words in a word document. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Microsoft package icon, install it.\n\n**3.** Edit the Config Node.\n'
  });
  f.node('bc543c', 'Core.Trigger.Inject', 'Inject', {})
    .then('1bd291', 'Core.Programming.Function', 'Config', {
    func: 'msg.wordpath = "C:/Users/user/Documents/sampleword.docx"; //Path to word document.\nmsg.oldtext = "Test"; // Text to change.\nmsg.newtext = "New"; // New text.\nreturn msg;'
  })
    .then('fd3f46', 'Robomotion.MicrosoftWord.OpenWord', 'Open Word', {
    path: Message('wordpath'),
    outApplicationId: Message('word_fd'),
    optVisible: true
  })
    .then('43efa7', 'Robomotion.MicrosoftWord.ReplaceText', 'Replace Text', {
    applicationId: Message('word_fd'),
    text: Message('oldtext'),
    newText: Message('newtext')
  })
    .then('d1092b', 'Robomotion.MicrosoftWord.CloseWord', 'Close Word', {
    applicationId: Message('word_fd'),
    saveAsPath: Custom(''),
    optSaveChanges: true,
    saveAs: '_'
  })
    .then('29102e', 'Core.Flow.Stop', 'Stop', {});
}).start();
