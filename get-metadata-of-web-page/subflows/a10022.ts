import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Description', (f) => {
  f.node('b30001', 'Core.Flow.Begin', 'Begin', {})
    .then('b30002', 'Core.Browser.RunScript', 'Get Description', {
      inPageId: Message('page_id'),
      func: `var m = document.querySelector('meta[name="description"]'); return m ? m.content : '';`,
      outResult: Message('web_page_description'),
    })
    .then('b30003', 'Core.Programming.Function', 'Branch On Empty', {
      outputs: 2,
      func: `return (msg.web_page_description && String(msg.web_page_description).trim()) ? [msg, null] : [null, msg];`,
    });

  f.node('b30004', 'Core.Programming.Function', 'Build Found Text', {
    func: `msg.dialog_text = 'The description for the given web page is:\\n\\n' + msg.web_page_description;
return msg;`,
  })
    .then('b30005', 'Core.Dialog.MessageBox', 'Show Description', {
      inTitle: Custom('Get metadata of a webpage.'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('b30006', 'Core.Programming.Function', 'Build Missing Text', {
    func: `msg.dialog_text = 'No description specified for the web page:\\n' + msg.url;
return msg;`,
  })
    .then('b30007', 'Core.Dialog.MessageBox', 'Show No Description', {
      inTitle: Custom('Get metadata of a webpage.'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('b30099', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('b30003', 0, 'b30004', 0);
  f.edge('b30003', 1, 'b30006', 0);
  f.edge('b30005', 0, 'b30099', 0);
  f.edge('b30007', 0, 'b30099', 0);
});
