import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('HTML Source', (f) => {
  f.node('b40001', 'Core.Flow.Begin', 'Begin', {})
    .then('b40002', 'Core.Programming.Function', 'Build Prompt Text', {
      func: `msg.dialog_text = 'Do you want to save the HTML source of the given webpage locally?\\nWeb page URL: ' + msg.url + '  '; return msg;`,
    })
    .then('b40003', 'Core.Dialog.MessageBox', 'Ask To Save', {
      inTitle: Custom('Do you want to save HTML source? '),
      inText: Message('dialog_text'),
      optType: 'yesno',
      outConfirmed: Message('save_confirmed'),
    })
    .then('b40004', 'Core.Programming.Function', 'Branch On Yes', {
      outputs: 2,
      func: `msg.default_save_path = global.get('$Home$') + '\\\\Desktop\\\\web_source.txt'; return msg.save_confirmed ? [msg, null] : [null, msg];`,
    });

  f.node('b40005', 'Core.Dialog.InputBox', 'Ask For Save Path', {
    inTitle: Custom('Select a text file to save HTML source into or just provide a new name'),
    inText: Custom('Enter the full path for the HTML source file:'),
    optDefault: Message('default_save_path'),
    outText: Message('save_path'),
  })
    .then('b40006', 'Core.Programming.Function', 'Branch On Path', {
      outputs: 2,
      func: `return (msg.save_path && msg.save_path.trim()) ? [msg, null] : [null, msg];`,
    });

  f.node('b40007', 'Core.Browser.RunScript', 'Get HTML Source', {
    inPageId: Message('page_id'),
    func: `return document.documentElement.outerHTML;`,
    outResult: Message('web_page_source'),
  })
    .then('b40008', 'Core.FileSystem.WriteFile', 'Save HTML', {
      inPath: Message('save_path'),
      inText: Message('web_page_source'),
      optBase64: false,
      optMode: 'truncate',
    });

  f.node('b40099', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('b40004', 0, 'b40005', 0);
  f.edge('b40004', 1, 'b40099', 0);
  f.edge('b40006', 0, 'b40007', 0);
  f.edge('b40006', 1, 'b40099', 0);
  f.edge('b40008', 0, 'b40099', 0);
});
