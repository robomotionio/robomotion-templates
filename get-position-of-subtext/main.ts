import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('507d615d-5c62-4cdb-9baf-95cd07933b45', 'Imported Get Position of Subtext', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Get Position of Subtext\n\nFinds the character index of a substring inside a larger string. A concise demo of the text-search primitives.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Dialog.InputBox', 'Ask Full Text', {
      inTitle: Custom('Get position of a subtext'),
      inText: Custom('Populate your text:'),
      optDefault: Custom('I love Robomotion!'),
      outText: Message('text_var'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Subtext', {
      inTitle: Custom('Get position of a subtext'),
      inText: Custom('Populate the subtext to look for:'),
      optDefault: Custom('Robomotion'),
      outText: Message('subtext_var'),
    })
    .then('a10004', 'Core.Programming.Function', 'Find Position', {
      outputs: 2,
      func: `msg.position = (msg.text_var || '').indexOf(msg.subtext_var || ''); return msg.position >= 0 ? [msg, null] : [null, msg];`,
    });

  f.node('a10005', 'Core.Programming.Function', 'Build Found Text', {
    func: `msg.dialog_text = "The subtext '" + msg.subtext_var + "' begins at character  " + msg.position; return msg;`,
  })
    .then('a10006', 'Core.Dialog.MessageBox', 'Show Found', {
      inTitle: Custom('Flow ran successfully!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10007', 'Core.Programming.Function', 'Build Not Found Text', {
    func: `msg.dialog_text = "The subtext '" + msg.subtext_var + "' wasn't found in the given text. "; return msg;`,
  })
    .then('a10008', 'Core.Dialog.MessageBox', 'Show Not Found', {
      inTitle: Custom('Flow ran successfully!'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10004', 1, 'a10007', 0);
  f.edge('a10006', 0, 'a10099', 0);
  f.edge('a10008', 0, 'a10099', 0);
});

myFlow.start();
