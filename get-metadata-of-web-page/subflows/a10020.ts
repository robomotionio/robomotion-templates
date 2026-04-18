import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Title', (f) => {
  f.node('b10001', 'Core.Flow.Begin', 'Begin', {})
    .then('b10002', 'Core.Browser.RunScript', 'Get Title', {
      inPageId: Message('page_id'),
      func: `return document.title;`,
      outResult: Message('web_page_title'),
    })
    .then('b10003', 'Core.Programming.Function', 'Build Dialog Text', {
      func: `msg.dialog_text = 'The title of the given web page is:\\n\\n' + (msg.web_page_title || '');
return msg;`,
    })
    .then('b10004', 'Core.Dialog.MessageBox', 'Show Title', {
      inTitle: Custom('Get metadata of a webpage.'),
      inText: Message('dialog_text'),
      optType: 'info',
    })
    .then('b10005', 'Core.Flow.End', 'End', { sfPort: 0 });
});
