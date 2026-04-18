import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Keywords', (f) => {
  f.node('b20001', 'Core.Flow.Begin', 'Begin', {})
    .then('b20002', 'Core.Browser.RunScript', 'Get Keywords', {
      inPageId: Message('page_id'),
      func: `var m = document.querySelector('meta[name="keywords"]'); return m ? m.content : '';`,
      outResult: Message('web_page_keywords'),
    })
    .then('b20003', 'Core.Programming.Function', 'Branch On Empty', {
      outputs: 2,
      func: `return (msg.web_page_keywords && String(msg.web_page_keywords).trim()) ? [msg, null] : [null, msg];`,
    });

  f.node('b20004', 'Core.Programming.Function', 'Build Found Text', {
    func: `msg.dialog_text = 'The keywords specified for the given web page are:\\n\\n' + msg.web_page_keywords;
return msg;`,
  })
    .then('b20005', 'Core.Dialog.MessageBox', 'Show Keywords', {
      inTitle: Custom('Get metadata of a webpage.'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('b20006', 'Core.Programming.Function', 'Build Missing Text', {
    func: `msg.dialog_text = 'No keywords specified for the web page:\\n' + msg.url;
return msg;`,
  })
    .then('b20007', 'Core.Dialog.MessageBox', 'Show No Keywords', {
      inTitle: Custom('Get metadata of a webpage.'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('b20099', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('b20003', 0, 'b20004', 0);
  f.edge('b20003', 1, 'b20006', 0);
  f.edge('b20005', 0, 'b20099', 0);
  f.edge('b20007', 0, 'b20099', 0);
});
