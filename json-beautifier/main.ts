import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('f89f539e-b74f-4117-a88f-038f5f146b15', 'Imported JSON Beautifier', (f) => {
  f.node('5f53e4', 'Core.Flow.Comment', 'Comment', { optText: '##### JSON Beautifier How-To \n\nThis template uses *Programming*, *File System* and *Dialog* nodes to beautify \na given JSON string.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.json field to the JSON string you want to beautify.\n\n**3.** Set the msg.export_to field to the full filepath of the .json file \nyou want to export.\n\n**4.** Set the msg.indent field to the string value that will be used as\nindentation in .json file.' });
  f.node('6778f2', 'Core.Trigger.Inject', 'Start', {})
    .then('55e041', 'Core.Programming.Function', 'config', { outputs: 2, func: '// [Required]\nmsg.json = `{"id":"613a15d8a0ff94364fde98b2","index":0,"guid":"cb44ba37-bfd0-4ca8-8783-a847812bd714","isActive":true,"balance":"$3,518.87","picture":"http://placehold.it/32x32","age":21,"tags":["ullamco","excepteur","duis","deserunt","in","anim","eiusmod"],"friends":[{"id":0,"name":"Regina Payne"},{"id":1,"name":"Mcbride Hammond"},{"id":2,"name":"Lydia Horton"}]}`;\nmsg.export_to = \'/home/gursoy/out.json\'; // [Required]\nmsg.indent = \'  \'; // [Required]\n\n// DO NOT edit below!\ntry {\n  var obj = JSON.parse(msg.json);\n  msg.json = JSON.stringify(obj, null, msg.indent);\n}\ncatch (e) {\n  return [null, msg];\n}\nreturn [msg, null];' })
    .then('792ddc', 'Core.FileSystem.WriteFile', 'Write File', {
    inPath: Message('export_to'),
    inText: Message('json'),
    optMode: 'truncate'
  });
  f.node('b3e694', 'Core.Dialog.MessageBox', 'Invalid Warning', {
    inTitle: Custom('JSON Beautifier'),
    inText: Custom('Invalid JSON'),
    optType: 'error'
  });
  f.node('9f1def', 'Core.Flow.Stop', 'Stop', {});

  f.edge('b3e694', 0, '9f1def', 0);
  f.edge('55e041', 1, 'b3e694', 0);
  f.edge('792ddc', 0, '9f1def', 0);
}).start();